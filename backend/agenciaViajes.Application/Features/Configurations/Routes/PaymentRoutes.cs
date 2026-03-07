using agenciaViajes.Application.Features.Payment.Common.Requests;
using agenciaViajes.Application.Features.Payment.CreatePayment;
using agenciaViajes.Application.Features.Payment.DeletePayment;
using agenciaViajes.Application.Features.Payment.GetPaymentById;
using agenciaViajes.Application.Features.Payment.GetPaymentsList;
using agenciaViajes.Application.Features.Payment.UpdatePayment;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace agenciaViajes.Application.Features.Configurations.Routes
{
    public static class PaymentRoutes
    {
        public const string ROUTE_TAGS = "Payment";
        public const string BASE_URL = "/api/Payment";

        public static void AddPaymentRoutes(this IEndpointRouteBuilder app)
        {
            var paymentGroup = app.MapGroup(BASE_URL)
                .WithTags(ROUTE_TAGS)
                .RequireAuthorization();

            paymentGroup.MapGet("/", GetPaymentsList);
            paymentGroup.MapGet("/{id:int}", GetPaymentById);
            paymentGroup.MapPost("/", CreatePayment);
            paymentGroup.MapPut("/{id:int}", UpdatePayment);
            paymentGroup.MapDelete("/{id:int}", DeletePayment);
        }

        private static async Task<IResult> GetPaymentsList(
            ISender sender,
            int? saleId = null,
            CancellationToken cancellationToken = default)
        {
            var response = await sender.Send(new GetPaymentsListQuery(saleId), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> GetPaymentById(
            int id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetPaymentByIdQuery(id), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NotFound(response);
        }

        private static async Task<IResult> CreatePayment(
            CreatePaymentRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new CreatePaymentCommand(request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> UpdatePayment(
            int id,
            UpdatePaymentRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new UpdatePaymentCommand(id, request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }

        private static async Task<IResult> DeletePayment(
            int id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new DeletePaymentCommand(id), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NotFound(response);
        }
    }
}
