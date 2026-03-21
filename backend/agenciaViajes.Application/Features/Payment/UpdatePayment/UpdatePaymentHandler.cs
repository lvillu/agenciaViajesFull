using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Payment.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.UpdatePayment
{
    public class UpdatePaymentHandler : IRequestHandler<UpdatePaymentCommand, Result<PaymentResponse>>
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly ISaleRepository _saleRepository;

        public UpdatePaymentHandler(
            IPaymentRepository paymentRepository,
            ISaleRepository saleRepository)
        {
            _paymentRepository = paymentRepository;
            _saleRepository = saleRepository;
        }

        public async Task<Result<PaymentResponse>> Handle(UpdatePaymentCommand request, CancellationToken cancellationToken)
        {
            // Validar que exista el pago
            var payment = await _paymentRepository.GetByIdAsync(request.Id, cancellationToken);
            if (payment == null)
            {
                return Result<PaymentResponse>.Failure("Pago no encontrado");
            }

            // Validar que exista la venta
            var sale = await _saleRepository.GetByIdAsync(request.Request.SaleId, cancellationToken);
            if (sale == null)
            {
                return Result<PaymentResponse>.Failure("La venta especificada no existe");
            }

            // Validar que el nuevo monto no exceda el saldo pendiente
            var totalPaid = await _saleRepository.GetTotalPaidAsync(request.Request.SaleId, cancellationToken);
            // Restar el pago actual para calcular el nuevo saldo
            var currentPaymentAmount = payment.SaleId == request.Request.SaleId ? payment.Amount : 0;
            var remainingBalance = sale.TotalAmount - (totalPaid - currentPaymentAmount);

            if (request.Request.Amount > remainingBalance)
            {
                return Result<PaymentResponse>.Failure($"El monto del pago ({request.Request.Amount:C}) excede el saldo pendiente ({remainingBalance:C})");
            }

            // Actualizar entidad - Convertir fecha a UTC
            payment.SaleId = request.Request.SaleId;
            payment.PaymentDate = request.Request.PaymentDate.ToUniversalTime();
            payment.Amount = request.Request.Amount;
            payment.ExchangeRate = request.Request.ExchangeRate;
            payment.AmountMXN = request.Request.AmountMXN;
            payment.Notes = request.Request.Notes;

            payment = await _paymentRepository.UpdateAsync(payment, cancellationToken);

            // Mapear a response
            var response = new PaymentResponse
            {
                Id = payment.Id,
                SaleId = payment.SaleId,
                SaleReservationNumber = sale.ReservationNumber,
                ClientName = sale.Client != null ? $"{sale.Client.Name} {sale.Client.LastName}" : null,
                PaymentDate = payment.PaymentDate,
                Amount = payment.Amount,
                ExchangeRate = payment.ExchangeRate,
                AmountMXN = payment.AmountMXN,
                Notes = payment.Notes,
                CreatedAt = payment.CreatedAt,
                ModifiedAt = payment.ModifiedAt
            };

            return Result<PaymentResponse>.Success(response, "Pago actualizado exitosamente");
        }
    }
}
