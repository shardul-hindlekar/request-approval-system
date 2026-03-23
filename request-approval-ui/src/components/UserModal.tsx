import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Typography,
  DialogContentText,
  Box,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../api/axios";
import { PASSWORD_RULES, validatePassword } from "../utils/passwordPolicy";
import type { UserDto } from "../types";
 
interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  user?: UserDto;
}
 
export default function UserModal({
  open,
  onClose,
  onSaved,
  user,
}: UserModalProps) {
  const isEditMode = !!user;
 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
 
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
 
  // Only validate once user starts typing
  const showChecklist = !isEditMode && password.length > 0;
  const passwordValidation = validatePassword(password);
 
  useEffect(() => {
    const fetchRoles = async () => {
      const res = await api.get("/admin/roles");
      setAvailableRoles(res.data);
    };
 
    fetchRoles();
 
    if (user) {
      setUsername(user.username);
      setRoles(user.roles || []);
      setPassword("");
    } else {
      setUsername("");
      setRoles([]);
      setPassword("");
    }
 
    setError(null);
    setShowPassword(false);
  }, [user, open]);
 
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
 
      if (!username.trim()) {
        setError("Username is required");
        return;
      }
 
      if (roles.length === 0) {
        setError("Select at least one role");
        return;
      }
 
      if (!isEditMode) {
        if (!password) {
          setError("Password is required");
          return;
        }
        // Frontend guard — backend also validates
        if (!passwordValidation.valid) {
          setError("Password does not meet all requirements");
          return;
        }
      }
 
      if (isEditMode) {
        await api.put(`/admin/${user.userId}`, {
          username,
          password: "",
          roles,
        });
        onSaved("User updated successfully");
      } else {
        await api.post("/admin/create", {
          username,
          password,
          roles,
        });
        onSaved("User created successfully");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };
 
  // Determine if the Create/Update button should be enabled
  const isSubmitDisabled =
    loading ||
    (!isEditMode && showChecklist && !passwordValidation.valid);
 
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {isEditMode ? "Edit User" : "Create User"}
        </DialogTitle>
 
        <DialogContent>
          <form autoComplete="off">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
 
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
 
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                autoComplete="new-username"
                onChange={(e) => setUsername(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
 
              {/* Password field — only in create mode */}
              {!isEditMode && (
                <Box>
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
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
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((v) => !v)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
 
                  {/* Live checklist */}
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
                        sx={{
                          display: "block",
                          mb: 1,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Password Requirements
                      </Typography>
 
                      <Stack spacing={0.75}>
                        {PASSWORD_RULES.map((rule) => {
                          const passed = rule.test(password);
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
              )}
 
              <FormControl
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={roles}
                  onChange={(e) => setRoles(e.target.value as string[])}
                  renderValue={(selected) => (selected as string[]).join(", ")}
                  label="Roles"
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      <Checkbox checked={roles.includes(role)} />
                      <ListItemText primary={role} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </form>
        </DialogContent>
 
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
 
          <Button
            variant="contained"
            sx={{ textTransform: "none", borderRadius: 2, px: 3 }}
            onClick={() => setConfirmOpen(true)}
            disabled={isSubmitDisabled}
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm {isEditMode ? "Update" : "Create"}
        </DialogTitle>
 
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary" }}>
            Are you sure you want to{" "}
            {isEditMode ? "update this user?" : "create this user?"}
          </DialogContentText>
        </DialogContent>
 
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ textTransform: "none", borderRadius: 2 }}
            onClick={handleSave}
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}