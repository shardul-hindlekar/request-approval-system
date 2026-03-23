

using Microsoft.EntityFrameworkCore;
using SendGrid.Helpers.Errors.Model;
using Shar_RequestApproval.API.DTOs;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;


namespace Shar_RequestApproval.API.Services
{
    public class RequestService
    {
        private readonly AppDbContext _context;

        public RequestService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Request> CreateRequest(CreateRequestDto dto, ClaimsPrincipal user)
        {
            var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var request = new Request
            {
                Title = dto.Title,
                Description = dto.Description,
                Amount = dto.Amount,
                Status = "Draft",
                CurrentAssignedRole = "Requester",
                CreatedBy = userId,
                CreatedDate = DateTime.UtcNow,
            };

            await _context.Requests.AddAsync(request);
            await _context.SaveChangesAsync();

            _context.AuditLogs.Add(new AuditLog
            {
                RequestId = request.RequestId,
                Action = "Request Created",
                ActionByUserId = userId,
                ActionByRole = "Requester",
                ActionDate = DateTime.UtcNow,
                Comments = "Initial draft created"
            });

            await _context.SaveChangesAsync();

            return request;
        }

        public async Task UpdateRequest(int requestId, CreateRequestDto dto, ClaimsPrincipal user)
        {
            var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var request = await _context.Requests.FindAsync(requestId);

            if (request == null)
                throw new NotFoundException("Request not found");

            if (request.CreatedBy != userId)
                throw new ForbiddenException("You can only edit your own requests");

            if (request.Status != "Draft")
                throw new ValidationException("Only Draft requests can be edited"); ;

            request.Title = dto.Title;
            request.Description = dto.Description;
            request.Amount = dto.Amount;

            AddAuditLog(requestId, user, "Draft Updated", "Requester");

            await _context.SaveChangesAsync();
        }

        public async Task<object> GetById(int requestId, ClaimsPrincipal user)
        {
            var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var roles = user.FindAll(ClaimTypes.Role)
                            .Select(r => r.Value)
                            .ToList();

            var request = await _context.Requests
    .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (request == null)
                throw new NotFoundException("Request not found");

            bool canView =
                (roles.Contains("Requester") && request.CreatedBy == userId) ||
                (roles.Contains("Reviewer") && request.CurrentAssignedRole == "Reviewer") ||
                (roles.Contains("Approver") && request.CurrentAssignedRole == "Approver");

            if (!canView)
                throw new ForbiddenException("You are not authorized to view this request");

            return new
            {
                requestId = request.RequestId,
                title = request.Title,
                description = request.Description,
                amount = request.Amount,
                status = request.Status,
                createdBy = request.CreatedBy,
                createdDate = request.CreatedDate
            };
        }

        public async Task SubmitForReview(int requestId, ClaimsPrincipal user)
        {
            var request = await _context.Requests.FindAsync(requestId);

            if (request == null)
                throw new NotFoundException("Request not found");

            if (request.Status != "Draft")
                throw new ValidationException("Only Draft requests can be submitted");

            request.Status = "PendingReview";
            request.CurrentAssignedRole = "Reviewer";

            AddAuditLog(requestId, user, "Submitted for Review", "Requester");

            await _context.SaveChangesAsync();
        }

        public async Task SendBackToRequester(int requestId, RequestActionDto dto, ClaimsPrincipal user)
        {
            var request = await _context.Requests.FindAsync(requestId); // was: Find()

            if (request == null)
                throw new NotFoundException("Request not found");

            if (request.Status != "PendingReview")
                throw new ValidationException("Only PendingReview requests can be sent back");

            request.Status = "Draft";
            request.CurrentAssignedRole = "Requester";

            AddAuditLog(requestId, user, "Sent Back to Requester", "Reviewer", dto.Comments);

            await _context.SaveChangesAsync(); // was: SaveChanges()
        }

        public async Task SubmitForApproval(int requestId, ClaimsPrincipal user)
        {
            var request = await _context.Requests.FindAsync(requestId); // was: Find()

            if (request == null)
                 throw new NotFoundException("Request not found");

            if (request.Status != "PendingReview")
                throw new ValidationException("Only PendingReview requests can be submitted for approval");

            request.Status = "PendingApproval";
            request.CurrentAssignedRole = "Approver";

            AddAuditLog(requestId, user, "Submitted for Approval", "Reviewer");

            await _context.SaveChangesAsync(); // was: SaveChanges()
        }

        public async Task Approve(int requestId, RequestActionDto dto, ClaimsPrincipal user)
        {
            var request = await _context.Requests.FindAsync(requestId);

            if (request == null)
                throw new NotFoundException("Request not found");

            if (request.Status != "PendingApproval")
                throw new ValidationException("Only PendingApproval requests can be approved");

            request.Status = "Approved";

            AddAuditLog(requestId, user, "Approved", "Approver", dto.Comments);

            await _context.SaveChangesAsync();
        }

        public async Task Reject(int requestId, RequestActionDto dto, ClaimsPrincipal user)
        {
            var request = await _context.Requests.FindAsync(requestId);

            if (request == null)
                throw new NotFoundException("Request not found");

            if (request.Status != "PendingApproval")
                throw new ValidationException("Only PendingApproval requests can be rejected");

            request.Status = "Rejected";

            AddAuditLog(requestId, user, "Rejected", "Approver", dto.Comments);

            await _context.SaveChangesAsync();
        }


        public async Task<List<object>> GetRequestsForUser(int userId, string activeRole)
        {
            IQueryable<Request> query = _context.Requests;

            if (activeRole == "Requester")
                query = query.Where(r => r.CreatedBy == userId);

            else if (activeRole == "Reviewer")
                query = query.Where(r =>
                    r.CurrentAssignedRole == "Reviewer" &&
                    r.Status == "PendingReview");

            else if (activeRole == "Approver")
                query = query.Where(r =>
                    r.CurrentAssignedRole == "Approver" &&
                    r.Status == "PendingApproval");

            else
                return new List<object>();

            return await query
                .OrderByDescending(r => r.CreatedDate)
                .Select(r => new
                {
                    requestId = r.RequestId,
                    title = r.Title,
                    amount = r.Amount,
                    status = r.Status,
                    createdBy = r.CreatedBy,
                    currentAssignedRole = r.CurrentAssignedRole,
                    createdDate = r.CreatedDate
                })
                .ToListAsync<object>();
        }

        public async Task<List<object>> GetCompletedRequests()
        {
            return await _context.Requests
                .Where(r => r.Status == "Approved" || r.Status == "Rejected")
                .OrderByDescending(r => r.CreatedDate)
                .Select(r => new
                {
                    requestId = r.RequestId,
                    title = r.Title,
                    amount = r.Amount,
                    status = r.Status,
                    createdDate = r.CreatedDate
                })
                .ToListAsync<object>();
        }



        private void AddAuditLog(int requestId, ClaimsPrincipal user, string action, string role, string? comments = null)
        {
            var userId = int.Parse(user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            _context.AuditLogs.Add(new AuditLog
            {
                RequestId = requestId,
                Action = action,
                ActionByUserId = userId,
                ActionByRole = role,
                ActionDate = DateTime.UtcNow,
                Comments = comments
            });
        }

        public async Task<List<AuditLogDto>> GetAuditLogsByRequestIdAsync(int requestId)
        {
            return await (
                from a in _context.AuditLogs
                join u in _context.Users on a.ActionByUserId equals u.UserId
                where a.RequestId == requestId
                orderby a.ActionDate descending
                select new AuditLogDto
                {
                    AuditLogId = a.AuditLogId,
                    RequestId = a.RequestId,
                    Action = a.Action,
                    ActionByUserId = a.ActionByUserId,
                    Username = u.Username,
                    ActionByRole = a.ActionByRole,
                    ActionDate = DateTime.SpecifyKind(a.ActionDate, DateTimeKind.Utc),
                    Comments = a.Comments
                }
            ).ToListAsync();
        }

        public async Task<List<AuditLogDto>> GetAllAuditLogsAsync()
        {
            return await (
                from a in _context.AuditLogs
                join u in _context.Users on a.ActionByUserId equals u.UserId
                orderby a.ActionDate descending
                select new AuditLogDto
                {
                    AuditLogId = a.AuditLogId,
                    RequestId = a.RequestId,
                    Action = a.Action,
                    ActionByUserId = a.ActionByUserId,
                    Username = u.Username,          // now actually populated
                    ActionByRole = a.ActionByRole,
                    ActionDate = DateTime.SpecifyKind(a.ActionDate, DateTimeKind.Utc),
                    Comments = a.Comments
                }
            ).ToListAsync();
        }

    }
}
