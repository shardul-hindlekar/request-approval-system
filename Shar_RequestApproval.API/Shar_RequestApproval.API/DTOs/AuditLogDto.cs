namespace Shar_RequestApproval.API.DTOs
{
    public class AuditLogDto
    {
            public int AuditLogId { get; set; }
            public int RequestId { get; set; }
            public string Action { get; set; }
            public int ActionByUserId { get; set; }
            public string Username { get; set; }
            public string ActionByRole { get; set; }
            public DateTime ActionDate { get; set; }
            public string? Comments { get; set; }
        
    }
}
