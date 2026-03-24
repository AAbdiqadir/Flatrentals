using System.Text.Json;
using bckend.Data;
using bckend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace bckend.Services;

public class SeedService(
    AppDbContext dbContext,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IWebHostEnvironment environment)
{
    private static readonly string[] Roles = ["Admin", "Owner", "Tenant"];

    public async Task SeedAsync()
    {
        await dbContext.Database.MigrateAsync();
        await SeedRolesAsync();
        var users = await SeedUsersAsync();
        await SeedFlatsFromJsonAsync(users.Owner.Id);
    }

    public async Task<int> SeedFlatsFromJsonAsync(string ownerId)
    {
        var jsonPath = Path.Combine(environment.ContentRootPath, "Seed", "seed-flats.json");
        if (!File.Exists(jsonPath))
        {
            return 0;
        }

        var json = await File.ReadAllTextAsync(jsonPath);
        var seedFlats = JsonSerializer.Deserialize<List<SeedFlat>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? [];

        var inserted = 0;

        foreach (var seed in seedFlats)
        {
            var exists = await dbContext.Flats.AnyAsync(f =>
                f.Address == seed.Address &&
                f.RentPrice == seed.RentPrice &&
                f.Rooms == seed.Rooms);

            if (exists)
            {
                continue;
            }

            var flat = new Flat
            {
                Address = seed.Address,
                City = seed.City,
                Description = seed.Description,
                RentPrice = seed.RentPrice,
                Rooms = seed.Rooms,
                Bathrooms = seed.Bathrooms,
                IsAvailable = seed.IsAvailable,
                OwnerId = ownerId,
                CreatedAt = DateTime.UtcNow,
                Images = seed.ImageUrls.Select(u => new FlatImage { Url = u }).ToList()
            };

            dbContext.Flats.Add(flat);
            inserted++;
        }

        await dbContext.SaveChangesAsync();
        return inserted;
    }

    private async Task SeedRolesAsync()
    {
        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }

    private async Task<(ApplicationUser Admin, ApplicationUser Owner, ApplicationUser Tenant)> SeedUsersAsync()
    {
        var admin = await EnsureUserAsync("admin@flatrent.com", "Admin User", "Admin", "Admin123$");
        var owner = await EnsureUserAsync("owner@flatrent.com", "Owner User", "Owner", "Owner123$");
        var tenant = await EnsureUserAsync("tenant@flatrent.com", "Tenant User", "Tenant", "Tenant123$");

        return (admin, owner, tenant);
    }

    private async Task<ApplicationUser> EnsureUserAsync(string email, string fullName, string role, string password)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = fullName,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Unable to create user {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }

        var roles = await userManager.GetRolesAsync(user);
        if (!roles.Contains(role))
        {
            await userManager.AddToRoleAsync(user, role);
        }

        return user;
    }
}
