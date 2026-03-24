using System.ComponentModel.DataAnnotations;

namespace bckend.DTOs.Users;

public class UserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class UserUpdateDto
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class AdminUserUpdateDto : UserUpdateDto
{
    [Required]
    public string Role { get; set; } = "Tenant";
}
