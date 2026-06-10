using SamaBoutique.Server.Models.DTOs;

namespace SamaBoutique.Server.Services.Interface
{
    public interface IAuthService
    {
        Task<(LoginResponse? Response, string? Error)> LoginAsync(LoginRequest req, string ip);
        Task<(LoginResponse? Response, string? Error)> RefreshAsync(string token, string ip);
        Task<(LoginResponse? Response, string? Error)> RegisterClientAsync(RegisterClientRequest req);
        Task<(LoginResponse? Response, string? Error)> RegisterWithOtpAsync(RegisterOtpRequest req);
        Task<(bool Ok, string? Error)> ResetPasswordWithOtpAsync(ResetPasswordOtpRequest req);
        Task<(bool Ok, string? Error)> ChangePasswordAsync(Guid userId, ChangePasswordRequest req);
        Task<bool> RevokeTokenAsync(Guid userId, string ip);
        Task<UserInfoDto?> GetMeAsync(Guid userId);
        Task<(UserInfoDto? User, string? Error)> UpdateProfileAsync(Guid userId, UpdateProfileRequest req);
    }
}
