namespace Shar_RequestApproval.API.DTOs
{
    public class LoginResponseDto
    {
        public string Token { get; set; }

        public List<string> Roles { get; set; }

        public string UserName { get; set; }

        public int UserId { get; set; }
    }
}
