using Microsoft.AspNetCore.Identity;
using Shar_RequestApproval.API;

namespace Shar_RequestApproval.Services
{
    public class PasswordService
    {
        private readonly PasswordHasher<User> _hasher;

        public PasswordService()
        {
            _hasher = new PasswordHasher<User>();
        }

        public string HashPassword(User user, string password)
        {
            return _hasher.HashPassword(user, password);
        }

        public bool VerifyPassword(User user, string enteredPassword, string storedHash)
        {
            var result = _hasher.VerifyHashedPassword(
                user,
                storedHash,
                enteredPassword);

            return result == PasswordVerificationResult.Success;
        }
    }
}
