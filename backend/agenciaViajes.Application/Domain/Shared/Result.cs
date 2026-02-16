namespace agenciaViajes.Application.Domain.Shared;

//Clase base retornar solo la respuesta exitosa o de error
public class Result
{
    public string Status { get; set; } = ResultConstants.SUCCESS_STATUS;
    public string Message { get; set; } = string.Empty;
    public bool IsSuccess { get; set; } = true;
    public static Result Success() => new();
    public static Result Failure(string message) => new()
    {
        IsSuccess = false,
        Status = ResultConstants.FAILURE_STATUS,
        Message = message
    };
}

//Para devolver objetos
public class Result<TResponse> : Result
{
    public TResponse? Data { get; set; }
    public static Result<TResponse> Success(TResponse value) => new() { Data = value };
    public static Result<TResponse> Success(TResponse value, string message) => new() { Data = value, Message = message };
    public static new Result<TResponse> Failure(string message) => new() { IsSuccess = false, Status = ResultConstants.FAILURE_STATUS, Message = message };
}

//Constante
public static class ResultConstants
{
    public const string SUCCESS_STATUS = "Completed";
    public const string FAILURE_STATUS = "Failure";
}