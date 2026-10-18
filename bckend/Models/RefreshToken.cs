namespace bckend.Models;

public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    // SHA-256 hash of the random token; never store the raw token.
    public string TokenHash { get; set; } = string.Empty;

    // Preserved when rotating tokens within the same login session.
    public Guid FamilyId { get; set; } = Guid.NewGuid();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }

    public bool IsPersistent { get; set; }

    // Snapshot of the user's Identity security stamp at login.
    public string? SecurityStamp { get; set; }
}