import {
  Container,
  Typography,
  Button,
  Stack,
  Paper,
  Box,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RoleSelectionPage() {
  const { roles, setActiveRole } = useAuth();
  const navigate = useNavigate();

  const selectRole = (role: string) => {
    setActiveRole(role);
    navigate("/dashboard");
  };

  const getIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <AdminPanelSettingsIcon />;
      case "Reviewer":
        return <RateReviewIcon />;
      default:
        return <PersonIcon />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #a8edea 0%, #0066cc 100%)",
        padding: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 5,
          maxWidth: 500,
          width: "100%",
          borderRadius: 4,
          textAlign: "center",
          backgroundColor: "rgba(255,255,255,0.95)",
          boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#003366" }}
        >
          Select Your Role
        </Typography>

        <Typography
          variant="body1"
          color="#004080"
          mb={5}
          sx={{ fontSize: 16 }}
        >
          Choose how you want to access the system
        </Typography>

        <Stack spacing={3}>
          {roles.map((role) => (
            <Button
              key={role}
              variant="contained"
              startIcon={getIcon(role)}
              onClick={() => selectRole(role)}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                borderRadius: 3,
                textTransform: "none",
                background: "linear-gradient(135deg, #3399ff 0%, #003366 100%)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                  background: "linear-gradient(135deg, #2673cc 0%, #002244 100%)",
                },
              }}
            >
              {role}
            </Button>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}