namespace SamaBoutique.Server.Models.DTOs
{
    public record LoginRequest(string Email, string Password);
    public record RegisterClientRequest(
    string Nom,
    string Email,
    string Password,
    string? Telephone,
    string? Adresse,
    DateTime? DateNaissance
);

    public record RegisterUserRequest(
        string Nom,
        string Email,
        string Password,
        Guid RoleId,
        string? Poste,
        decimal CommissionPct
    );

    public record RefreshTokenRequest(string RefreshToken);

    // ── OTP (inscription style Jumia) ──────────────────────────────────────
    public record SendOtpRequest(string Contact);
    public record SendOtpResponse(string Channel, string? DevCode);
    public record VerifyOtpRequest(string Contact, string Otp);
    public record VerifyOtpResponse(string VerifyToken);
    public record RegisterOtpRequest(string Nom, string Password, string VerifyToken);
    public record ResetPasswordOtpRequest(string VerifyToken, string NewPassword);

    public record ChangePasswordRequest(
        string CurrentPassword,
        string NewPassword,
        string ConfirmNewPassword
    );

    public record ForgotPasswordRequest(string Email);
    public record ResetPasswordRequest(string Token, string NewPassword, string ConfirmNewPassword);

    // Mise à jour du profil par l'utilisateur connecté (client)
    public record UpdateProfileRequest(string Nom, string? Telephone, string? Email);

    public record LoginResponse(
        string AccessToken,
        string RefreshToken,
        DateTime ExpiresAt,
        UserInfoDto User
    );

    public record UserInfoDto(
        Guid Id,
        string Nom,
        string Email,
        string Role,
        List<string> Permissions,
        string? Telephone = null
    );

}
