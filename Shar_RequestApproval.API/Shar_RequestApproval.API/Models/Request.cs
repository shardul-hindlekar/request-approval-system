using System.ComponentModel.DataAnnotations.Schema;

[Table("Requests_Shardul")]
public class Request
{
    public int RequestId { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public decimal Amount { get; set; }

    public string Status { get; set; }

    public string CurrentAssignedRole { get; set; }

    public int CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; }
}