import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PASSWORD_RULES, validatePassword } from "../utils/passwordPolicy";
 
export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
 
  const navigate = useNavigate();
  const { logout } = useAuth();
 
  // Only validate once user starts typing new password
  const showChecklist = newPassword.length > 0;
  const passwordValidation = validatePassword(newPassword);
 
  const handleSubmit = async () => {
    setError(null);
 
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }
 
    // Frontend guard — backend will also validate
    if (!passwordValidation.valid) {
      setError("New password does not meet all requirements");
      return;
    }
 
    setLoading(true);
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
 
      setMessage(res.data.message || "Password changed successfully");
 
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Change Password
        </Typography>
 
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your new password must meet all requirements below.
        </Typography>
 
        <Stack spacing={3}>
          {/* Current Password */}
          <TextField
            label="Current Password"
            type={showCurrent ? "text" : "password"}
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrent((v) => !v)}
                    edge="end"
                  >
                    {showCurrent ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
 
          {/* New Password */}
          <Box>
            <TextField
              label="New Password"
              type={showNew ? "text" : "password"}
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              // Show red border only after user has started typing and it's invalid
              error={showChecklist && !passwordValidation.valid}
              helperText={
                showChecklist && passwordValidation.valid
                  ? "✓ Password meets all requirements"
                  : " "
              }
              FormHelperTextProps={{
                sx: {
                  color:
                    showChecklist && passwordValidation.valid
                      ? "success.main"
                      : "text.secondary",
                  fontWeight:
                    showChecklist && passwordValidation.valid ? 600 : 400,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNew((v) => !v)}
                      edge="end"
                    >
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
 
            {/* Live checklist — only shown once user starts typing */}
            {showChecklist && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ display: "block", mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  Password Requirements
                </Typography>
 
                <Stack spacing={0.75}>
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(newPassword);
                    return (
                      <Box
                        key={rule.label}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {passed ? (
                          <CheckCircleOutlineIcon
                            sx={{ fontSize: 16, color: "success.main" }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ fontSize: 16, color: "error.main" }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            color: passed ? "success.main" : "error.main",
                            fontWeight: passed ? 600 : 400,
                            transition: "color 0.2s ease",
                          }}
                        >
                          {rule.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
 
          <Button
            variant="contained"
            onClick={handleSubmit}
            // Disable if new password is being typed but doesn't pass yet
            disabled={loading || (showChecklist && !passwordValidation.valid)}
            sx={{ borderRadius: 2, py: 1.2 }}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </Stack>
      </Paper>
 
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage(null)}
      >
        <Alert severity="success" variant="filled">
          {message}
        </Alert>
      </Snackbar>
 
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}