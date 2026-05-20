using SamaBoutique.Server.Models.Entities;
using SamaBoutique.Server.Models.Responses;
using SamaBoutique.Server.Repositories.Interface;
using System.Net;
using System.Security.Claims;
using System.Text.Json;

namespace SamaBoutique.Server.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception non gérée : {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }
        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var (statusCode, message) = exception switch
            {
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Accès non autorisé"),
                KeyNotFoundException => (HttpStatusCode.NotFound, "Ressource introuvable"),
                ArgumentException ex => (HttpStatusCode.BadRequest, ex.Message),
                InvalidOperationException ex => (HttpStatusCode.BadRequest, ex.Message),
                _ => (HttpStatusCode.InternalServerError, "Une erreur interne est survenue")
            };

            context.Response.StatusCode = (int)statusCode;

            var response = ApiResponse<object>.Fail(message, (int)statusCode);

            // En développement, inclure le détail de l'erreur
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
                response.Errors.Add(exception.ToString());

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
        }

        public class AuditMiddleware
        {
            private readonly RequestDelegate _next;
            private readonly ILogger<AuditMiddleware> _logger;

            private static readonly HashSet<string> AuditedMethods = new() { "POST", "PUT", "PATCH", "DELETE" };

            public AuditMiddleware(RequestDelegate next, ILogger<AuditMiddleware> logger)
            {
                _next = next;
                _logger = logger;
            }

            public async Task InvokeAsync(HttpContext context, IAuditRepository auditRepo)
            {
                await _next(context);

                // Auditer seulement si l'utilisateur est authentifié et la méthode est mutante
                if (!AuditedMethods.Contains(context.Request.Method)) return;
                if (!context.User.Identity?.IsAuthenticated ?? true) return;
                if (context.Response.StatusCode >= 500) return;

                try
                {
                    var userIdClaim = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                    if (!Guid.TryParse(userIdClaim, out var userId)) return;

                    var module = context.Request.Path.Value?.Split('/').Skip(2).FirstOrDefault() ?? "unknown";
                    var action = context.Request.Method;
                    var detail = $"{context.Request.Method} {context.Request.Path} → {context.Response.StatusCode}";
                    var ip = context.Connection.RemoteIpAddress?.ToString();

                    await auditRepo.AddAsync(new AuditLog
                    {
                        UserId = userId,
                        Module = module,
                        Action = action,
                        Detail = detail,
                        IpAddress = ip
                    });

                    await auditRepo.SaveAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Erreur lors de l'écriture du log d'audit");
                }
            }
        }
    }
}
