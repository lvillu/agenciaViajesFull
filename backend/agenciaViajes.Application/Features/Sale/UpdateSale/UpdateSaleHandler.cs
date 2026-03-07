using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.UpdateSale
{
    public class UpdateSaleHandler : IRequestHandler<UpdateSaleCommand, Result<SaleResponse>>
    {
        private readonly ISaleRepository _saleRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IProviderRepository _providerRepository;

        public UpdateSaleHandler(
            ISaleRepository saleRepository,
            IClientRepository clientRepository,
            IProviderRepository providerRepository)
        {
            _saleRepository = saleRepository;
            _clientRepository = clientRepository;
            _providerRepository = providerRepository;
        }

        public async Task<Result<SaleResponse>> Handle(UpdateSaleCommand request, CancellationToken cancellationToken)
        {
            // Validar que exista la venta
            var sale = await _saleRepository.GetByIdAsync(request.Id, cancellationToken);
            if (sale == null)
            {
                return Result<SaleResponse>.Failure("Venta no encontrada");
            }

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

            // Validar número de reserva único (si se proporciona y cambió)
            if (!string.IsNullOrWhiteSpace(request.Request.ReservationNumber) && 
                request.Request.ReservationNumber != sale.ReservationNumber)
            {
                var exists = await _saleRepository.ExistsByReservationNumberAsync(
                    request.Request.ReservationNumber, 
                    request.Id, 
                    cancellationToken);
                
                if (exists)
                {
                    return Result<SaleResponse>.Failure("Ya existe una venta con ese número de reserva");
                }
            }

            // Actualizar entidad - Convertir fechas a UTC
            sale.ClientId = request.Request.ClientId;
            sale.ProviderId = request.Request.ProviderId;
            sale.ReservationNumber = request.Request.ReservationNumber;
            sale.Description = request.Request.Description;
            sale.TotalAmount = request.Request.TotalAmount;
            sale.IsDollar = request.Request.IsDollar;
            sale.RequiredDeposit = request.Request.RequiredDeposit;
            sale.FinalPaymentDueDate = request.Request.FinalPaymentDueDate?.ToUniversalTime();
            sale.TravelDate = request.Request.TravelDate.ToUniversalTime();
            sale.ReturnDate = request.Request.ReturnDate?.ToUniversalTime();
            sale.Status = request.Request.Status;

            sale = await _saleRepository.UpdateAsync(sale, cancellationToken);

            var totalPaid = await _saleRepository.GetTotalPaidAsync(sale.Id, cancellationToken);
            var remainingBalance = sale.TotalAmount - totalPaid;

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
                RequiredDeposit = sale.RequiredDeposit,
                FinalPaymentDueDate = sale.FinalPaymentDueDate,
                TravelDate = sale.TravelDate,
                ReturnDate = sale.ReturnDate,
                Status = sale.Status,
                Active = sale.Active,
                TotalPaid = totalPaid,
                RemainingBalance = remainingBalance,
                CreatedAt = sale.CreatedAt,
                ModifiedAt = sale.ModifiedAt
            };

            return Result<SaleResponse>.Success(response, "Venta actualizada exitosamente");
        }
    }
}
