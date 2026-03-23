namespace Shar_RequestApproval.API.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public bool IsActive { get; set; }
        public List<string> Roles { get; set; }
    }
}
