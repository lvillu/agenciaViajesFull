using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.DeletePayment
{
    public class DeletePaymentHandler : IRequestHandler<DeletePaymentCommand, Result>
    {
        private readonly IPaymentRepository _paymentRepository;

        public DeletePaymentHandler(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<Result> Handle(DeletePaymentCommand request, CancellationToken cancellationToken)
        {
            var deleted = await _paymentRepository.DeleteAsync(request.Id, cancellationToken);

            if (!deleted)
            {
                return Result.Failure("Pago no encontrado");
            }

            return Result.Success();
        }
    }
}
