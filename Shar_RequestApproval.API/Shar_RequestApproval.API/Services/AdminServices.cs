using Microsoft.EntityFrameworkCore;
using Shar_RequestApproval.API.DTOs;
using Shar_RequestApproval.API.Exceptions;
using Shar_RequestApproval.Services;

namespace Shar_RequestApproval.API.Services
{
    public class AdminService
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _passwordService;

        public AdminService(AppDbContext context, PasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        public async Task<List<object>> GetAllUsersAsync()
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.IsActive,
                    Roles = u.UserRoles.Select(r => r.Role.Name).ToList()
                })
                .Cast<object>()
                .ToListAsync();
        }

        public async Task UpdateUserAsync(int id, RegisterRequestDto dto)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                throw new NotFoundException("User not found");

            //  CHECK IF USERNAME EXISTS 
            var usernameExists = await _context.Users
                .AnyAsync(u => u.Username == dto.Username && u.UserId != id);

            if (usernameExists)
                throw new ValidationException("Username already exists");

            user.Username = dto.Username;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                user.PasswordHash = _passwordService.HashPassword(user, dto.Password);
            }

            if (user.UserRoles != null && user.UserRoles.Any())
                _context.UserRoles.RemoveRange(user.UserRoles);

            foreach (var roleName in dto.Roles)
            {
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
                if (role == null)
                    throw new NotFoundException($"Role {roleName} not found");

                _context.UserRoles.Add(new UserRole
                {
                    UserId = user.UserId,
                    RoleId = role.RoleId
                });
            }

            await _context.SaveChangesAsync();
        }


        public async Task DeleteUserAsync(int id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                throw new NotFoundException("User not found");

            if (!user.IsActive)
                throw new ValidationException("User is already inactive");

            // 🚀 SOFT DELETE
            user.IsActive = false;

            await _context.SaveChangesAsync();
        }

        public async Task ReactivateUserAsync(int id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                throw new NotFoundException("User not found");

            if (user.IsActive)
                throw new ValidationException("User is already active");

            user.IsActive = true;

            await _context.SaveChangesAsync();
        }
    }
}
