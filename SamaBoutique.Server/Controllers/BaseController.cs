using Microsoft.AspNetCore.Mvc;
using SamaBoutique.Server.Models.Responses;
using System.Security.Claims;

namespace SamaBoutique.Server.Controllers
{
    [ApiController]
    public class BaseController : ControllerBase
    {
        protected Guid CurrentUserId =>
    Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Utilisateur non authentifié"));

        protected string CurrentUserIp =>
            HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        protected IActionResult ApiOk<T>(T data, string message = "Succès")
            => Ok(ApiResponse<T>.Ok(data, message));

        protected IActionResult ApiCreated<T>(T data, string actionName, object routeValues, string message = "Créé avec succès")
            => CreatedAtAction(actionName, routeValues, ApiResponse<T>.Created(data, message));

        protected IActionResult ApiFail(string message, int statusCode = 400, List<string>? errors = null)
        {
            var response = ApiResponse<object>.Fail(message, statusCode, errors);
            return StatusCode(statusCode, response);
        }

        protected IActionResult ApiNotFound(string message = "Ressource introuvable")
            => NotFound(ApiResponse<object>.NotFound(message));

        protected IActionResult ApiPaged<T>(PagedResponse<T> paged) => Ok(paged);
    }
}
