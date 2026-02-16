using agenciaViajes.Application.Domain.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;

namespace agenciaViajes.Application.Domain.Middleware
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

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ValidationException ex)
            {
                await HandleValidationExceptionAsync(context, ex, _logger);
            }
            catch (Exception ex)
            {
                await HandleGlobalExceptionAsync(context, ex, _logger);
            }
        }

        private static Task HandleValidationExceptionAsync(HttpContext context, ValidationException ex, ILogger<ExceptionMiddleware> logger)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            string errMessage = "Error(es) de validacion: " + String.Join(" ", ex.Errors.Select(e => e.ErrorMessage));

            var result = JsonSerializer.Serialize(Result<string>.Failure(errMessage));
            //logger.LogError(ex, errMessage);
            return context.Response.WriteAsync(result);
        }

        private static Task HandleGlobalExceptionAsync(HttpContext context, Exception ex, ILogger<ExceptionMiddleware> logger)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var result = JsonSerializer.Serialize(new
            {
                success = false,
                message = ex.Message
            });

            //logger.LogError(ex, ex.Message);

            return context.Response.WriteAsync(result);
        }
    }
}
