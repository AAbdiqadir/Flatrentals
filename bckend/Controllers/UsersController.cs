using System.Security.Claims;
using bckend.DTOs.Users;
using bckend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace bckend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<UserResponseDto>> GetMe()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return NotFound();
        }

        var roles = await userManager.GetRolesAsync(user);
        return Ok(MapUser(user, roles.FirstOrDefault() ?? string.Empty));
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserResponseDto>> UpdateMe(UserUpdateDto request)
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return NotFound();
        }

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.UserName = request.Email;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        var roles = await userManager.GetRolesAsync(user);
        return Ok(MapUser(user, roles.FirstOrDefault() ?? string.Empty));
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return NotFound();
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        return NoContent();
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllUsers()
    {
        var users = userManager.Users.ToList();
        var mapped = new List<UserResponseDto>();

        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            mapped.Add(MapUser(user, roles.FirstOrDefault() ?? string.Empty));
        }

        return Ok(mapped);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserResponseDto>> UpdateByAdmin(string id, AdminUserUpdateDto request)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        var allowedRoles = new[] { "Admin", "Owner", "Tenant" };
        if (!allowedRoles.Contains(request.Role))
        {
            return BadRequest("Invalid role.");
        }

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.UserName = request.Email;

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return BadRequest(updateResult.Errors.Select(e => e.Description));
        }

        var existingRoles = await userManager.GetRolesAsync(user);
        if (existingRoles.Any())
        {
            await userManager.RemoveFromRolesAsync(user, existingRoles);
        }

        await userManager.AddToRoleAsync(user, request.Role);
        return Ok(MapUser(user, request.Role));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteByAdmin(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == id)
        {
            return BadRequest("Admin cannot delete self.");
        }

        var user = await userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        return NoContent();
    }

    private static UserResponseDto MapUser(ApplicationUser user, string role)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Role = role
        };
    }
}
