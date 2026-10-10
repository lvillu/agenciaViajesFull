using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Payment.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.GetPaymentsList
{
    public class GetPaymentsListHandler : IRequestHandler<GetPaymentsListQuery, Result<PagedResponse<PaymentResponse>>>
    {
        private readonly IPaymentRepository _paymentRepository;

        public GetPaymentsListHandler(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<Result<PagedResponse<PaymentResponse>>> Handle(GetPaymentsListQuery request, CancellationToken cancellationToken)
        {
            var (page, pageSize) = Paging.Normalize(request.Page, request.PageSize);
            var (items, total) = request.SaleId.HasValue
                ? await _paymentRepository.GetPagedBySaleIdAsync(request.SaleId.Value, page, pageSize, cancellationToken)
                : await _paymentRepository.GetPagedAsync(page, pageSize, cancellationToken);

            var responses = items.Select(payment => new PaymentResponse
            {
                Id = payment.Id,
                SaleId = payment.SaleId,
                FolioNumber = payment.FolioNumber,
                PaymentType = (int)payment.PaymentType,
                PaymentTypeName = payment.PaymentType.ToString(),
                SaleReservationNumber = payment.Sale?.SaleProviders.FirstOrDefault()?.ReservationNumber
                    ?? payment.Sale?.ReservationNumber,
                ClientName = payment.Sale?.Client != null ? $"{payment.Sale.Client.Name} {payment.Sale.Client.LastName}" : null,
                PaymentDate = payment.PaymentDate,
                Amount = payment.Amount,
                ExchangeRate = payment.ExchangeRate,
                AmountMXN = payment.AmountMXN,
                TransactionFee = payment.TransactionFee,
                Notes = payment.Notes,
                CreatedAt = payment.CreatedAt,
                ModifiedAt = payment.ModifiedAt
            }).ToList();

            return Result<PagedResponse<PaymentResponse>>.Success(new PagedResponse<PaymentResponse>
            {
                Items = responses,
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }
    }
}
