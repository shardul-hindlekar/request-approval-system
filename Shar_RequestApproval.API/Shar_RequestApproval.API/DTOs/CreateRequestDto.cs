using System.ComponentModel.DataAnnotations;

namespace Shar_RequestApproval.API.DTOs
{
    public class CreateRequestDto
    {
        [Required(ErrorMessage = "Title is required")]
        [MinLength(3, ErrorMessage = "Title must be at least 3 characters")]
        [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, 10_000_000, ErrorMessage = "Amount must be between 0.01 and 10,000,000")]
        public decimal Amount { get; set; }
    }
}
