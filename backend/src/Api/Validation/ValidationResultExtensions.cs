using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;

namespace Api.Validation;

public static class ValidationResultExtensions
{
    /// <summary>Converts a failed FluentValidation result into a ProblemDetails 400 response.</summary>
    public static ObjectResult ToProblem(this ValidationResult result) =>
        new(new ValidationProblemDetails(result.ToDictionary())
        {
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest,
        })
        {
            StatusCode = StatusCodes.Status400BadRequest,
            ContentTypes = { "application/problem+json" },
        };
}
