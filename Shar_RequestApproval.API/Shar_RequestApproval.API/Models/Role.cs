using System.ComponentModel.DataAnnotations.Schema;

[Table("Roles_Shardul")]
public class Role
{
    public int RoleId { get; set; }

    public string Name { get; set; }

    public ICollection<UserRole> UserRoles { get; set; }
}