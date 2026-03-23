using System.ComponentModel.DataAnnotations;

namespace Shar_RequestApproval.API.DTOs
{
    public class RequestActionDto
    {
        [MaxLength(1000, ErrorMessage = "Comments cannot exceed 1000 characters")]
        public string Comments { get; set; }
    }
}
