using Microsoft.AspNetCore.Mvc;
using Shar_RequestApproval.API.DTOs;
using Shar_RequestApproval.API.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Shar_RequestApproval.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("Authentication")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDto request)
        {
                var response = await _authService.Login(request);
                return Ok(response);
        }

        [HttpPost("register")]
        [Tags("Authentication")]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
                var response = await _authService.Register(request);
                return Ok(response);
            
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            try
            {
                var userId = int.Parse(
                    User.FindFirst(ClaimTypes.NameIdentifier).Value
                );

                await _authService.ChangePassword(userId, dto);

                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}