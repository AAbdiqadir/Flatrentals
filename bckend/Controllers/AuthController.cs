using bckend.DTOs.Auth;
using bckend.Models;
using bckend.Filters;
using bckend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using bckend.Data;
using Microsoft.EntityFrameworkCore;

namespace bckend.Controllers;

[ApiController]
[Route("api/[controller]")]
[SessionRequest]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    JwtTokenService jwtTokenService,
    AuthSessionService sessions
    ) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterRequestDto request,
    CancellationToken ct)
    {
        var role = request.Role.Trim();
        if (!new[] { "Tenant", "Owner" }.Contains(role, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest("Role must be Tenant or Owner.");
        }

        if (await userManager.FindByEmailAsync(request.Email) is not null)
        {
            return Conflict("Email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        await userManager.AddToRoleAsync(user, role);

        var roles = await userManager.GetRolesAsync(user);
        var token = jwtTokenService.CreateToken(user, roles);

        return Ok(await sessions.StartAsync(
            HttpContext,
            user,
            request.RememberMe,
            ct));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login(
        LoginRequestDto request,
        CancellationToken ct)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        if (user is null)
            return Unauthorized("Invalid credentials.");

        var result = await signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: true);

        if (!result.Succeeded)
            return Unauthorized("Invalid credentials.");

        return Ok(await sessions.StartAsync(
            HttpContext,
            user,
            request.RememberMe,
            ct));
    }
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Refresh(
        CancellationToken ct)
    {
        var response = await sessions.RefreshAsync(HttpContext, ct);

        if (response is null)
            return Unauthorized("Session expired. Please sign in again.");

        return Ok(response);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        await sessions.EndAsync(HttpContext, ct);
        return NoContent();
    }
}
