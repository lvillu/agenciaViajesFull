using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Payment.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.GetPaymentsList
{
    public class GetPaymentsListHandler : IRequestHandler<GetPaymentsListQuery, Result<List<PaymentResponse>>>
    {
        private readonly IPaymentRepository _paymentRepository;

        public GetPaymentsListHandler(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<Result<List<PaymentResponse>>> Handle(GetPaymentsListQuery request, CancellationToken cancellationToken)
        {
            var payments = request.SaleId.HasValue
                ? await _paymentRepository.GetBySaleIdAsync(request.SaleId.Value, cancellationToken)
                : await _paymentRepository.GetAllAsync(cancellationToken);

            var responses = payments.Select(payment => new PaymentResponse
            {
                Id = payment.Id,
                SaleId = payment.SaleId,
                SaleReservationNumber = payment.Sale?.ReservationNumber,
                ClientName = payment.Sale?.Client != null ? $"{payment.Sale.Client.Name} {payment.Sale.Client.LastName}" : null,
                PaymentDate = payment.PaymentDate,
                Amount = payment.Amount,
                ExchangeRate = payment.ExchangeRate,
                AmountMXN = payment.AmountMXN,
                Notes = payment.Notes,
                CreatedAt = payment.CreatedAt,
                ModifiedAt = payment.ModifiedAt
            }).ToList();

            return Result<List<PaymentResponse>>.Success(responses);
        }
    }
}
