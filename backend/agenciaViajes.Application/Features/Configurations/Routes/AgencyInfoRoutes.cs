using agenciaViajes.Application.Features.AgencyInfo.Common.Requests;
using agenciaViajes.Application.Features.AgencyInfo.GetAgencyInfo;
using agenciaViajes.Application.Features.AgencyInfo.UpdateAgencyInfo;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace agenciaViajes.Application.Features.Configurations.Routes
{
    public static class AgencyInfoRoutes
    {
        public const string ROUTE_TAGS = "AgencyInfo";
        public const string BASE_URL = "/api/AgencyInfo";

        public static void AddAgencyInfoRoutes(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup(BASE_URL)
                .WithTags(ROUTE_TAGS)
                .RequireAuthorization();

            group.MapGet("/", GetAgencyInfo);
            group.MapPut("/", UpdateAgencyInfo);
        }

        private static async Task<IResult> GetAgencyInfo(
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetAgencyInfoQuery(), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.NotFound(response);
        }

        private static async Task<IResult> UpdateAgencyInfo(
            UpdateAgencyInfoRequest request,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new UpdateAgencyInfoCommand(request), cancellationToken);
            return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
        }
    }
}
