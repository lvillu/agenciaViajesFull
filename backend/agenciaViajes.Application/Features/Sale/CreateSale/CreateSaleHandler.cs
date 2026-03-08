using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.CreateSale
{
    public class CreateSaleHandler : IRequestHandler<CreateSaleCommand, Result<SaleResponse>>
    {
        private readonly ISaleRepository _saleRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IProviderRepository _providerRepository;
        private readonly IPaymentRepository _paymentRepository;

        public CreateSaleHandler(
            ISaleRepository saleRepository,
            IClientRepository clientRepository,
            IProviderRepository providerRepository,
            IPaymentRepository paymentRepository)
        {
            _saleRepository = saleRepository;
            _clientRepository = clientRepository;
            _providerRepository = providerRepository;
            _paymentRepository = paymentRepository;
        }

        public async Task<Result<SaleResponse>> Handle(CreateSaleCommand request, CancellationToken cancellationToken)
        {
            // Validar que exista el cliente
            var client = await _clientRepository.GetByIdAsync(request.Request.ClientId, cancellationToken);
            if (client == null)
            {
                return Result<SaleResponse>.Failure("El cliente especificado no existe");
            }

            // Validar que exista el proveedor
            var provider = await _providerRepository.GetByIdAsync(request.Request.ProviderId, cancellationToken);
            if (provider == null)
            {
                return Result<SaleResponse>.Failure("El proveedor especificado no existe");
            }

            // Validar número de reserva único (si se proporciona)
            if (!string.IsNullOrWhiteSpace(request.Request.ReservationNumber))
            {
                var exists = await _saleRepository.ExistsByReservationNumberAsync(
                    request.Request.ReservationNumber, 
                    null, 
                    cancellationToken);
                
                if (exists)
                {
                    return Result<SaleResponse>.Failure("Ya existe una venta con ese número de reserva");
                }
            }

            // Crear entidad - Convertir fechas a UTC
            var sale = new Domain.Entities.Sale
            {
                ClientId = request.Request.ClientId,
                ProviderId = request.Request.ProviderId,
                ReservationNumber = request.Request.ReservationNumber,
                Description = request.Request.Description,
                TotalAmount = request.Request.TotalAmount,
                IsDollar = request.Request.IsDollar,
                ProfitPercentage = request.Request.ProfitPercentage,
                RequiredDeposit = request.Request.RequiredDeposit,
                FinalPaymentDueDate = request.Request.FinalPaymentDueDate?.ToUniversalTime(),
                TravelDate = request.Request.TravelDate.ToUniversalTime(),
                ReturnDate = request.Request.ReturnDate?.ToUniversalTime(),
                Status = request.Request.Status ?? "Pendiente",
                Active = true
            };

            sale = await _saleRepository.CreateAsync(sale, cancellationToken);

            // Si se proporcionó un anticipo, registrar el pago inicial automáticamente
            decimal totalPaid = 0;
            if (request.Request.RequiredDeposit.HasValue && request.Request.RequiredDeposit.Value > 0)
            {
                var initialPayment = new Domain.Entities.Payment
                {
                    SaleId = sale.Id,
                    PaymentDate = DateTime.UtcNow,
                    Amount = request.Request.RequiredDeposit.Value,
                    Notes = "Anticipo inicial registrado automáticamente al crear la venta"
                };

                await _paymentRepository.CreateAsync(initialPayment, cancellationToken);
                totalPaid = request.Request.RequiredDeposit.Value;
            }

            // Mapear a response
            var response = new SaleResponse
            {
                Id = sale.Id,
                ClientId = sale.ClientId,
                ClientName = $"{client.Name} {client.LastName}",
                ProviderId = sale.ProviderId,
                ProviderName = provider.Name,
                ReservationNumber = sale.ReservationNumber,
                Description = sale.Description,
                TotalAmount = sale.TotalAmount,
                IsDollar = sale.IsDollar,
                ProfitPercentage = sale.ProfitPercentage,
                ProfitAmount = sale.ProfitPercentage.HasValue ? Math.Round(sale.TotalAmount * sale.ProfitPercentage.Value / 100, 2) : null,
                RequiredDeposit = sale.RequiredDeposit,
                FinalPaymentDueDate = sale.FinalPaymentDueDate,
                TravelDate = sale.TravelDate,
                ReturnDate = sale.ReturnDate,
                Status = sale.Status,
                Active = sale.Active,
                TotalPaid = totalPaid,
                RemainingBalance = sale.TotalAmount - totalPaid,
                CreatedAt = sale.CreatedAt,
                ModifiedAt = sale.ModifiedAt
            };

            return Result<SaleResponse>.Success(response, "Venta creada exitosamente");
        }
    }
}
