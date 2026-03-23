using System.ComponentModel.DataAnnotations.Schema;

[Table("Users_Shardul")]
public class User
{
    public int UserId { get; set; }

    public string Username { get; set; }

    public string PasswordHash { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<UserRole> UserRoles { get; set; }
}