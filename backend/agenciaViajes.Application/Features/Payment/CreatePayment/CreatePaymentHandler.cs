using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Payment.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.CreatePayment
{
    public class CreatePaymentHandler : IRequestHandler<CreatePaymentCommand, Result<PaymentResponse>>
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly ISaleRepository _saleRepository;
        private readonly IAccountService _accountService;

        public CreatePaymentHandler(
            IPaymentRepository paymentRepository,
            ISaleRepository saleRepository,
            IAccountService accountService)
        {
            _paymentRepository = paymentRepository;
            _saleRepository = saleRepository;
            _accountService = accountService;
        }

        public async Task<Result<PaymentResponse>> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
        {
            // Validar que exista la venta
            var sale = await _saleRepository.GetByIdAsync(request.Request.SaleId, cancellationToken);
            if (sale == null)
            {
                return Result<PaymentResponse>.Failure("La venta especificada no existe");
            }

            // Validar que el monto del pago no exceda el saldo pendiente
            var totalPaid = await _saleRepository.GetTotalPaidAsync(request.Request.SaleId, cancellationToken);
            var remainingBalance = sale.TotalAmount - totalPaid;

            if (request.Request.Amount > remainingBalance)
            {
                return Result<PaymentResponse>.Failure($"El monto del pago ({request.Request.Amount:C}) excede el saldo pendiente ({remainingBalance:C})");
            }

            // Calcular FolioNumber auto-incremental global
            var folioNumber = await _paymentRepository.GetNextFolioNumberAsync(cancellationToken);

            // Calcular PaymentType automáticamente
            var paymentType = totalPaid == 0
                ? PaymentType.Anticipo
                : request.Request.Amount >= remainingBalance
                    ? PaymentType.Liquidacion
                    : PaymentType.Abono;

            // Crear entidad con account isolation
            var payment = new Domain.Entities.Payment
            {
                SaleId = request.Request.SaleId,
                FolioNumber = folioNumber,
                PaymentType = paymentType,
                PaymentDate = request.Request.PaymentDate.ToUniversalTime(),
                Amount = request.Request.Amount,
                ExchangeRate = request.Request.ExchangeRate,
                AmountMXN = request.Request.AmountMXN,
                TransactionFee = request.Request.TransactionFee,
                Notes = request.Request.Notes,
                AccountId = _accountService.AccountId
            };

            payment = await _paymentRepository.CreateAsync(payment, cancellationToken);

            var response = new PaymentResponse
            {
                Id = payment.Id,
                SaleId = payment.SaleId,
                FolioNumber = payment.FolioNumber,
                PaymentType = (int)payment.PaymentType,
                PaymentTypeName = payment.PaymentType.ToString(),
                SaleReservationNumber = sale.ReservationNumber,
                ClientName = sale.Client != null ? $"{sale.Client.Name} {sale.Client.LastName}" : null,
                PaymentDate = payment.PaymentDate,
                Amount = payment.Amount,
                ExchangeRate = payment.ExchangeRate,
                AmountMXN = payment.AmountMXN,
                TransactionFee = payment.TransactionFee,
                Notes = payment.Notes,
                CreatedAt = payment.CreatedAt,
                ModifiedAt = payment.ModifiedAt
            };

            return Result<PaymentResponse>.Success(response, "Pago registrado exitosamente");
        }
    }
}
