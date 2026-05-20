namespace SamaBoutique.Server.Models.Responses
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
        public int StatusCode { get; set; }

        public static ApiResponse<T> Ok(T data, string message = "Succès")
       => new() { Success = true, Data = data, Message = message, StatusCode = 200 };

        public static ApiResponse<T> Created(T data, string message = "Créé avec succès")
            => new() { Success = true, Data = data, Message = message, StatusCode = 201 };

        public static ApiResponse<T> Fail(string message, int statusCode = 400, List<string>? errors = null)
            => new() { Success = false, Message = message, StatusCode = statusCode, Errors = errors ?? new() };

        public static ApiResponse<T> NotFound(string message = "Ressource introuvable")
            => new() { Success = false, Message = message, StatusCode = 404 };

        public static ApiResponse<T> Unauthorized(string message = "Accès non autorisé")
            => new() { Success = false, Message = message, StatusCode = 401 };

        public static ApiResponse<T> Forbidden(string message = "Permission refusée")
            => new() { Success = false, Message = message, StatusCode = 403 };

        public static ApiResponse<T> ServerError(string message = "Erreur interne du serveur")
            => new() { Success = false, Message = message, StatusCode = 500 };
    }
    public class ApiResponse : ApiResponse<object>
    {
        public static ApiResponse OkEmpty(string message = "Succès")
            => new() { Success = true, Message = message, StatusCode = 200 };
    }
    public class PagedResponse<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = "Succès";
        public List<T> Data { get; set; } = new();
        public PaginationMeta Pagination { get; set; } = new();

        public static PagedResponse<T> Ok(List<T> data, int total, int page, int pageSize)
            => new()
            {
                Data = data,
                Pagination = new PaginationMeta
                {
                    TotalCount = total,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)total / pageSize),
                    HasNext = page * pageSize < total,
                    HasPrevious = page > 1
                }
            };
    }
    public class PaginationMeta
    {
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNext { get; set; }
        public bool HasPrevious { get; set; }
    }
}
