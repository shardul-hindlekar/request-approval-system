using Shar_RequestApproval.API.Exceptions;
using System.Text.RegularExpressions;

namespace Shar_RequestApproval.API.Services
{
    public class PasswordPolicyService
    {
        private static readonly Regex HasUppercase = new(@"[A-Z]");
        private static readonly Regex HasLowercase = new(@"[a-z]");
        private static readonly Regex HasDigit = new(@"[0-9]");
        private static readonly Regex HasSpecialChar = new(@"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]");
        private static readonly Regex HasWhitespace = new(@"\s");

        public void Validate(string password)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ValidationException("Password is required");
            }

            if (password.Length < 8)
                errors.Add("at least 8 characters");

            if (!HasUppercase.IsMatch(password))
                errors.Add("at least one uppercase letter");

            if (!HasLowercase.IsMatch(password))
                errors.Add("at least one lowercase letter");

            if (!HasDigit.IsMatch(password))
                errors.Add("at least one number");

            if (!HasSpecialChar.IsMatch(password))
                errors.Add("at least one special character (!@#$%^&* etc.)");

            if (HasWhitespace.IsMatch(password))
                errors.Add("no spaces allowed");

            if (errors.Any())
            {
                throw new ValidationException(
                    $"Password must contain: {string.Join(", ", errors)}"
                );
            }
        }
    }
}