using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;
using bckend.Data;
using bckend.DTOs.Auth;
using bckend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace bckend.Services;

public class AuthSessionService(
    AppDbContext db,
    UserManager<ApplicationUser> userManager,
    JwtTokenService jwtTokenService,
    IWebHostEnvironment environment)
{
    public const string CookieName = "flat_rental_refresh";

    public async Task<AuthResponseDto> StartAsync(
        HttpContext context,
        ApplicationUser user,
        bool rememberMe,
        CancellationToken ct)
    {
        // Replace any previous session associated with this cookie.
        await EndAsync(context, ct);

        var now = DateTime.UtcNow;
        var rawToken = NewToken();

        var session = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = Hash(rawToken),
            CreatedAt = now,
            ExpiresAt = rememberMe
                ? now.AddDays(7)
                : now.AddHours(12),
            IsPersistent = rememberMe,
            SecurityStamp = user.SecurityStamp
        };

        var response = await CreateResponseAsync(
            user,
            session.ExpiresAt);

        db.RefreshTokens.Add(session);
        await db.SaveChangesAsync(ct);

        WriteCookie(context, rawToken, session);

        return response;
    }

    public async Task<AuthResponseDto?> RefreshAsync(
        HttpContext context,
        CancellationToken ct)
    {
        var rawToken = context.Request.Cookies[CookieName];

        var grant = await WithFamilyAsync(
            rawToken,
            async current =>
            {
                var now = DateTime.UtcNow;

                var invalid =
                    current.RevokedAt is not null ||
                    current.ExpiresAt <= now ||
                    current.SecurityStamp != current.User.SecurityStamp ||
                    await userManager.IsLockedOutAsync(current.User);

                if (invalid)
                {
                    await RevokeFamilyAsync(current.FamilyId, ct);
                    return null;
                }

                var nextRawToken = NewToken();

                var next = new RefreshToken
                {
                    UserId = current.UserId,
                    TokenHash = Hash(nextRawToken),
                    FamilyId = current.FamilyId,
                    CreatedAt = now,

                    // Refreshing does not restart the 7-day/12-hour clock.
                    ExpiresAt = current.ExpiresAt,
                    IsPersistent = current.IsPersistent,
                    SecurityStamp = current.SecurityStamp
                };

                var response = await CreateResponseAsync(
                    current.User,
                    next.ExpiresAt);

                await db.RefreshTokens
                    .Where(t => t.Id == current.Id)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(
                            t => t.RevokedAt,
                            (DateTime?)now),
                        ct);

                db.RefreshTokens.Add(next);

                try
                {
                    await db.SaveChangesAsync(ct);
                }
                finally
                {
                    db.Entry(next).State = EntityState.Detached;
                }

                return new Grant(response, nextRawToken, next);
            },
            ct);

        if (grant is null)
        {
            ClearCookie(context);
            return null;
        }

        WriteCookie(context, grant.RawToken, grant.Session);
        return grant.Response;
    }

    public async Task EndAsync(
        HttpContext context,
        CancellationToken ct)
    {
        await WithFamilyAsync(
            context.Request.Cookies[CookieName],
            async current =>
            {
                await RevokeFamilyAsync(current.FamilyId, ct);
                return null;
            },
            ct);

        ClearCookie(context);
    }

    private async Task<Grant?> WithFamilyAsync(
        string? rawToken,
        Func<RefreshToken, Task<Grant?>> action,
        CancellationToken ct)
    {
        // 64 random bytes produce 88 Base64 characters.
        if (string.IsNullOrWhiteSpace(rawToken) ||
            rawToken.Length != 88)
        {
            return null;
        }

        var hash = Hash(rawToken);

        return await db.Database
            .CreateExecutionStrategy()
            .ExecuteAsync(async () =>
            {
                await using var transaction =
                    await db.Database.BeginTransactionAsync(ct);

                var familyId = await db.RefreshTokens
                    .AsNoTracking()
                    .Where(t => t.TokenHash == hash)
                    .Select(t => (Guid?)t.FamilyId)
                    .SingleOrDefaultAsync(ct);

                if (familyId is null)
                    return null;

                // PostgreSQL transaction lock for this login session.
                var lockKey = BinaryPrimitives.ReadInt64BigEndian(
                    SHA256.HashData(familyId.Value.ToByteArray()));

                await db.Database.ExecuteSqlInterpolatedAsync(
                    $"SELECT pg_advisory_xact_lock({lockKey})",
                    ct);

                // Read again after obtaining the lock.
                var current = await db.RefreshTokens
                    .AsNoTracking()
                    .Include(t => t.User)
                    .SingleOrDefaultAsync(
                        t => t.TokenHash == hash,
                        ct);

                if (current is null)
                    return null;

                var result = await action(current);

                await transaction.CommitAsync(ct);
                return result;
            });
    }

    private Task<int> RevokeFamilyAsync(
        Guid familyId,
        CancellationToken ct)
    {
        var now = DateTime.UtcNow;

        return db.RefreshTokens
            .Where(t =>
                t.FamilyId == familyId &&
                t.RevokedAt == null)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(
                    t => t.RevokedAt,
                    (DateTime?)now),
                ct);
    }

    private async Task<AuthResponseDto> CreateResponseAsync(
        ApplicationUser user,
        DateTime sessionExpiry)
    {
        var roles = await userManager.GetRolesAsync(user);

        var expiresAt = DateTime.UtcNow.Add(
            jwtTokenService.AccessTokenLifetime);

        if (expiresAt > sessionExpiry)
            expiresAt = sessionExpiry;

        return new AuthResponseDto
        {
            Token = jwtTokenService.CreateToken(
                user,
                roles,
                expiresAt),
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Role = roles.FirstOrDefault() ?? string.Empty
        };
    }

    private CookieOptions CookieOptions() => new()
    {
        HttpOnly = true,
        Secure = !environment.IsDevelopment(),
        SameSite = SameSiteMode.Strict,
        Path = "/api",
        IsEssential = true
    };

    private void WriteCookie(
        HttpContext context,
        string rawToken,
        RefreshToken session)
    {
        var options = CookieOptions();

        if (session.IsPersistent)
        {
            options.Expires =
                new DateTimeOffset(session.ExpiresAt);
        }

        context.Response.Cookies.Append(
            CookieName,
            rawToken,
            options);
    }

    private void ClearCookie(HttpContext context)
    {
        context.Response.Cookies.Delete(
            CookieName,
            CookieOptions());
    }

    private static string NewToken() =>
        Convert.ToBase64String(
            RandomNumberGenerator.GetBytes(64));

    private static string Hash(string token) =>
        Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private sealed record Grant(
        AuthResponseDto Response,
        string RawToken,
        RefreshToken Session);
}