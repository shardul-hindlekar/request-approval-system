namespace Shar_RequestApproval.API.DTOs
{
    public class RegisterResponseDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public List<string> Roles { get; set; }
    }
}
