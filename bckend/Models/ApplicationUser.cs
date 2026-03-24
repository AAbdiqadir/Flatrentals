using Microsoft.AspNetCore.Identity;

namespace bckend.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}
