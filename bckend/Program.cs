using System.Text;
using bckend.Data;
using bckend.Models;
using bckend.Options;
using bckend.Services;
using bckend.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServiceExtentions(builder.Configuration);

var app = builder.Build();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

var isEfDesignTime =
    Environment.CommandLine.Contains("ef.dll", StringComparison.OrdinalIgnoreCase) ||
    AppDomain.CurrentDomain.GetAssemblies().Any(a => a.GetName().Name == "Microsoft.EntityFrameworkCore.Design");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseExceptionHandler();

app.MapControllers();

if (!isEfDesignTime)
{
    var shouldSeedDemoData =
        builder.Configuration.GetValue<bool>("Seed:DemoData");

    var migrateOnly = args.Contains(
    "--migrate-only",
    StringComparer.OrdinalIgnoreCase);

    var shouldMigrate =
        migrateOnly ||
        builder.Configuration.GetValue<bool>(
            "Database:ApplyMigrationsOnStartup");

    if (shouldMigrate)
    {
        using var scope = app.Services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        await dbContext.Database.MigrateAsync();
    }

    if (migrateOnly)
    {
        return;
}
    if (shouldSeedDemoData && !app.Environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "Demo data seeding can only run in Development.");
    }

    

    if (app.Environment.IsDevelopment() && shouldSeedDemoData)
    {
        using var scope = app.Services.CreateScope();

        var seeder = scope.ServiceProvider
            .GetRequiredService<SeedService>();

        await seeder.SeedAsync();
    }

    app.Run();
}