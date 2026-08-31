using agenciaViajes.Application.Domain.Entities;
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

        public UpdateSaleHandler(
            ISaleRepository saleRepository,
            IClientRepository clientRepository)
        {
            _saleRepository = saleRepository;
            _clientRepository = clientRepository;
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

            // Actualizar entidad - Convertir fechas a UTC
            sale.ClientId = request.Request.ClientId;
            sale.Description = request.Request.Description;
            sale.TotalAmount = request.Request.TotalAmount;
            sale.IsDollar = request.Request.IsDollar;
            sale.ProfitPercentage = request.Request.ProfitPercentage;
            sale.RequiredDeposit = request.Request.RequiredDeposit;
            sale.FinalPaymentDueDate = request.Request.FinalPaymentDueDate?.ToUniversalTime();
            sale.TravelDate = request.Request.TravelDate.ToUniversalTime();
            sale.ReturnDate = request.Request.ReturnDate?.ToUniversalTime();
            sale.Status = request.Request.Status;

            // Reemplazar completamente los SaleProviders
            sale.SaleProviders.Clear();
            foreach (var providerReq in request.Request.Providers)
            {
                sale.SaleProviders.Add(new SaleProvider
                {
                    ProviderId = providerReq.ProviderId,
                    ReservationNumber = providerReq.ReservationNumber
                });
            }

            sale = await _saleRepository.UpdateAsync(sale, cancellationToken);

            var totalPaid = await _saleRepository.GetTotalPaidAsync(sale.Id, cancellationToken);
            var remainingBalance = sale.TotalAmount - totalPaid;

            // Mapear a response
            var response = new SaleResponse
            {
                Id = sale.Id,
                ClientId = sale.ClientId,
                ClientName = $"{client.Name} {client.LastName}",
                ProviderId = sale.SaleProviders.FirstOrDefault()?.ProviderId,
                ProviderName = sale.SaleProviders.FirstOrDefault()?.Provider?.Name,
                ReservationNumber = sale.SaleProviders.FirstOrDefault()?.ReservationNumber,
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
                RemainingBalance = remainingBalance,
                CreatedAt = sale.CreatedAt,
                ModifiedAt = sale.ModifiedAt,
                Providers = sale.SaleProviders.Select(sp => new SaleProviderDto
                {
                    Id = sp.Id,
                    ProviderId = sp.ProviderId,
                    ProviderName = sp.Provider?.Name,
                    ProviderAcronym = sp.Provider?.Acronym,
                    ReservationNumber = sp.ReservationNumber
                }).ToList()
            };

            return Result<SaleResponse>.Success(response, "Venta actualizada exitosamente");
        }
    }
}
