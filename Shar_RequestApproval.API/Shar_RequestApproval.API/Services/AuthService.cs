using Microsoft.EntityFrameworkCore;
using Shar_RequestApproval.API.DTOs;
using Shar_RequestApproval.API.Helpers;
using Shar_RequestApproval.API;
using Shar_RequestApproval.Services;
using Shar_RequestApproval.API.Exceptions;

namespace Shar_RequestApproval.API.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly JwtHelper _jwtHelper;
        private readonly PasswordPolicyService _passwordPolicy;

        public AuthService(AppDbContext context, PasswordService passwordService, JwtHelper jwtHelper, PasswordPolicyService passwordPolicy)
        {
            _context = context;
            _passwordService = passwordService;
            _jwtHelper = jwtHelper;
            _passwordPolicy = passwordPolicy;
        }

        public async Task<LoginResponseDto> Login(LoginRequestDto request)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

            if (user == null)
                throw new UnauthorizedAccessException("Invalid username or password");

            var isPasswordValid = _passwordService.VerifyPassword(
                user,
                request.Password,
                user.PasswordHash
            );

            if (!isPasswordValid)
                throw new UnauthorizedAccessException("Invalid username or password");

            var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();

            var token = _jwtHelper.GenerateToken(user, roles);

            return new LoginResponseDto
            {
                Token = token,
                Roles = roles,
                UserName = user.Username,
                UserId = user.UserId
            };
        }


        public async Task<RegisterResponseDto> Register(RegisterRequestDto request)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                    throw new ValidationException("Username already exists");

                if (!string.IsNullOrEmpty(request.Password))
                    _passwordPolicy.Validate(request.Password);

                var user = new User { Username = request.Username };
                user.PasswordHash = _passwordService.HashPassword(user, request.Password!);

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var roles = new List<Role>();

                foreach (var roleName in request.Roles)
                {
                    var role = await _context.Roles
                        .FirstOrDefaultAsync(r => r.Name.ToLower() == roleName.ToLower());

                    if (role == null)
                        throw new NotFoundException($"Role '{roleName}' does not exist");

                    roles.Add(role);

                    _context.UserRoles.Add(new UserRole
                    {
                        UserId = user.UserId,
                        RoleId = role.RoleId
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new RegisterResponseDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Roles = roles.Select(r => r.Name).ToList()
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task ChangePassword(int userId, ChangePasswordDto dto)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                throw new NotFoundException("User not found");

            var isCurrentValid = _passwordService.VerifyPassword(user, dto.CurrentPassword, user.PasswordHash);

            if (!isCurrentValid)
                throw new ValidationException("Current password is incorrect");

            _passwordPolicy.Validate(dto.NewPassword);

            user.PasswordHash = _passwordService.HashPassword(user, dto.NewPassword);
            await _context.SaveChangesAsync();
        }
    }
}

