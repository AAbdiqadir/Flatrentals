using System.Text;
using bckend.Data;
using bckend.helpers;
using bckend.Models;
using bckend.Options;
using bckend.Interfaces;

using AutoMapper;
using bckend.Services;
using bckend.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace bckend.Extensions;

public static class ApplicationServicesExtensions
{

    public static IServiceCollection AddApplicationServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<AppDbContext>(
            dbContextOptions => dbContextOptions.UseNpgsql(connectionString,
            postgresOptions => postgresOptions.EnableRetryOnFailure()));           

        services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "Flat Rental API", Version = "v1" });

                var securityScheme = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter JWT Bearer token",
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = JwtBearerDefaults.AuthenticationScheme
                    }
                };

                options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    { securityScheme, [] }
                });
            });
        services.AddEndpointsApiExplorer();
        services.AddCors(options =>
            {
                options.AddPolicy("frontend", policy =>
                {
                    policy
                        .WithOrigins("http://localhost:4200")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });
        services.AddHealthChecks().AddDbContextCheck<AppDbContext>("database", tags: ["ready"]);
        services.AddScoped<JwtTokenService>();
        services.AddScoped<SeedService>();
        services.AddScoped<AuthSessionService>();
        services.Configure<CompreFaceOptions>(configuration.GetSection("CompreFace"));
        services.AddHttpClient<IFaceRecognitionService, CompreFaceRecognitionService>();
        services.AddProblemDetails();

        services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration =
                    configuration.GetConnectionString("Redis")
                    ?? throw new InvalidOperationException("Missing Redis connection.");

                options.InstanceName = "FlatRentals:";
            });
        services.AddScoped<IImageStorage, ImageStorage>();
        services.Configure<CloudinarySettings>(configuration.GetSection("CloudinarySettings"));
        
        
        return services;
    }

}
