using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("AuditLogs_Shardul")]
public class AuditLog
{
    public int AuditLogId { get; set; }

    public int RequestId { get; set; }

    public string Action { get; set; }

    public int ActionByUserId { get; set; }

    public string ActionByRole { get; set; }

    public DateTime ActionDate { get; set; }

    public string? Comments { get; set; }
}