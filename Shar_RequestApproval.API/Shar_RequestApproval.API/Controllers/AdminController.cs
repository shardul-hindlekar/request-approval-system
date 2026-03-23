using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shar_RequestApproval.API.DTOs;
using Shar_RequestApproval.API.Services;
using Shar_RequestApproval.Services;

namespace Shar_RequestApproval.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AdminService _adminService;
        private readonly AuthService _authService;
        private readonly RequestService _requestService;

        public AdminController(AdminService adminService, AuthService authService, AppDbContext context, RequestService requestService)
        {
            _adminService = adminService;
            _authService = authService;
            _context = context;
            _requestService = requestService;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            return Ok(await _adminService.GetAllUsersAsync());
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateUser(RegisterRequestDto dto)
        {
                var result = await _authService.Register(dto);
                return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, RegisterRequestDto dto)
        {
                await _adminService.UpdateUserAsync(id, dto);
                return Ok(new { message = "User updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
                await _adminService.DeleteUserAsync(id);
                return Ok(new { message = "User deleted successfully" });

        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .Select(r => r.Name)
                .ToListAsync();

            return Ok(roles);
        }

        [HttpGet("audit")]
        public async Task<IActionResult> GetAllAuditLogs()
        {
            try
            {
                var logs = await _requestService.GetAllAuditLogsAsync();
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("reactivate/{id}")]
        public async Task<IActionResult> ReactivateUser(int id)
        {
                await _adminService.ReactivateUserAsync(id);
                return Ok(new { message = "User reactivated successfully" });
        }
    }
}
