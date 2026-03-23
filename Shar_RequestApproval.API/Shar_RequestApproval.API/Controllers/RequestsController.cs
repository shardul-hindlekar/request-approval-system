using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shar_RequestApproval.API.DTOs;
using Shar_RequestApproval.API.Services;
using System.Security.Claims;

namespace Shar_RequestApproval.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Tags("Request")]
    public class RequestsController : Controller
    {
        private readonly RequestService _requestService;

        public RequestsController(RequestService requestService)
        {
            _requestService = requestService;
        }

        [HttpPost]
        [Authorize(Roles = "Requester")]
        public async Task<IActionResult> Create(CreateRequestDto dto)
        {
            var result = await _requestService.CreateRequest(dto, User);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _requestService.GetById(id, User);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Requester")]
        public async Task<IActionResult> Update(int id, CreateRequestDto dto)
        {
            await _requestService.UpdateRequest(id, dto, User);
            return Ok(new { message = "Draft updated successfully" });
        }

        [HttpPost("{id}/submit")]
        [Authorize(Roles = "Requester")]
        public async Task<IActionResult> SubmitForReview(int id)
        {
            await _requestService.SubmitForReview(id, User);
            return Ok(new { message = "Submitted for review" });
        }

        [HttpPost("{id}/send-back")]
        [Authorize(Roles = "Reviewer")]
        public async Task<IActionResult> SendBack(int id, RequestActionDto dto)
        {
            await _requestService.SendBackToRequester(id, dto, User);
            return Ok(new { message = "Sent back to requester" });
        }

        [HttpPost("{id}/submit-approval")]
        [Authorize(Roles = "Reviewer")]
        public async Task<IActionResult> SubmitForApproval(int id)
        {
             await _requestService.SubmitForApproval(id, User);
            return Ok(new { message = "Submitted for approval" });
        }

        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Approver")]
        public async Task<IActionResult> Approve(int id, RequestActionDto dto)
        {
            await _requestService.Approve(id, dto, User);
            return Ok(new { message = "Request approved" });
        }

        [HttpPost("{id}/reject")]
        [Authorize(Roles = "Approver")]
        public async Task<IActionResult> Reject(int id, RequestActionDto dto)
        {
            await _requestService.Reject(id, dto, User);
            return Ok(new { message = "Request rejected" });
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetRequests([FromHeader(Name = "X-Active-Role")] string activeRole)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var userRoles = User.FindAll(ClaimTypes.Role)
                                .Select(r => r.Value)
                                .ToList();

            if (string.IsNullOrEmpty(activeRole))
                return BadRequest("Active role is required");

            if (!userRoles.Contains(activeRole))
                return Forbid();

            var requests = await _requestService.GetRequestsForUser(userId, activeRole);

            return Ok(requests);
        }

        [HttpGet("completed")]
        [Authorize]
        public async Task<IActionResult> GetCompleted()
        {
            var completed = await _requestService.GetCompletedRequests();
            return Ok(completed);
        }

        [HttpGet("{id}/audit")]
        public async Task<IActionResult> GetAuditLogs(int id)
        {
            var logs = await _requestService.GetAuditLogsByRequestIdAsync(id);
            return Ok(logs);
        }
    }
}