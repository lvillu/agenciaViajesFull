using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Payment.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.GetPaymentById
{
    public class GetPaymentByIdHandler : IRequestHandler<GetPaymentByIdQuery, Result<PaymentResponse>>
    {
        private readonly IPaymentRepository _paymentRepository;

        public GetPaymentByIdHandler(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<Result<PaymentResponse>> Handle(GetPaymentByIdQuery request, CancellationToken cancellationToken)
        {
            var payment = await _paymentRepository.GetByIdAsync(request.Id, cancellationToken);

            if (payment == null)
            {
                return Result<PaymentResponse>.Failure("Pago no encontrado");
            }

            var response = new PaymentResponse
            {
                Id = payment.Id,
                SaleId = payment.SaleId,
                FolioNumber = payment.FolioNumber,
                PaymentType = (int)payment.PaymentType,
                PaymentTypeName = payment.PaymentType.ToString(),
                SaleReservationNumber = payment.Sale?.ReservationNumber,
                ClientName = payment.Sale?.Client != null ? $"{payment.Sale.Client.Name} {payment.Sale.Client.LastName}" : null,
                PaymentDate = payment.PaymentDate,
                Amount = payment.Amount,
                ExchangeRate = payment.ExchangeRate,
                AmountMXN = payment.AmountMXN,
                TransactionFee = payment.TransactionFee,
                Notes = payment.Notes,
                CreatedAt = payment.CreatedAt,
                ModifiedAt = payment.ModifiedAt
            };

            return Result<PaymentResponse>.Success(response);
        }
    }
}
