export interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}
 
export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}
 
export const PASSWORD_RULES: PasswordRule[] = [
  {
    label: "At least 8 characters",
    test: (p) => p.length >= 8,
  },
  {
    label: "One uppercase letter (A-Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    label: "One lowercase letter (a-z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    label: "One number (0-9)",
    test: (p) => /[0-9]/.test(p),
  },
  {
    label: "One special character (!@#$%^&*...)",
    test: (p) => /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(p),
  },
  {
    label: "No spaces",
    test: (p) => !/\s/.test(p),
  },
];
 
export function validatePassword(password: string): PasswordValidation {
  const errors = PASSWORD_RULES.filter((r) => !r.test(password)).map(
    (r) => r.label
  );
  return { valid: errors.length === 0, errors };
}
 