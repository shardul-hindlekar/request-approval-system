using Shar_RequestApproval.API.Exceptions;
using System.Net;
using System.Text.Json;

namespace Shar_RequestApproval.API.Middleware
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
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            int statusCode;
            string message;

            // Map each custom exception to the right HTTP status
            switch (ex)
            {
                case NotFoundException:
                    statusCode = (int)HttpStatusCode.NotFound;       // 404
                    message = ex.Message;
                    break;

                case Exceptions.ValidationException:
                    statusCode = (int)HttpStatusCode.BadRequest;     // 400
                    message = ex.Message;
                    break;

                case ForbiddenException:
                    statusCode = (int)HttpStatusCode.Forbidden;      // 403
                    message = ex.Message;
                    break;

                case UnauthorizedAccessException:
                    statusCode = (int)HttpStatusCode.Unauthorized;   // 401
                    message = ex.Message;
                    break;

                default:
                    // Log unexpected errors; don't expose internals to the client
                    _logger.LogError(ex, "Unhandled exception");
                    statusCode = (int)HttpStatusCode.InternalServerError; // 500
                    message = "An unexpected error occurred";
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var response = new
            {
                status = statusCode,
                message
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}