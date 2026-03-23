using System.ComponentModel.DataAnnotations;

namespace Shar_RequestApproval.API.DTOs
{
    public class RegisterRequestDto
    {
        [Required(ErrorMessage = "Username is required")]
        [MinLength(3, ErrorMessage = "Username must be at least 3 characters")]
        [MaxLength(100, ErrorMessage = "Username cannot exceed 100 characters")]
        public string Username { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Password { get; set; }

        [Required(ErrorMessage = "At least one role is required")]
        [MinLength(1, ErrorMessage = "At least one role must be assigned")]
        public List<string> Roles { get; set; } = new();
    }
}
