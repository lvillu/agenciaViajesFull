using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Auth.Common.Requests;
using agenciaViajes.Application.Features.Auth.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Auth.SignUp
{
    public sealed record SignUpCommand(SignUpRequest Request) : IRequest<Result<UserResponse>>, ITransactionalCommand { }
}
