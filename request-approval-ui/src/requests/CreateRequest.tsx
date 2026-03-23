import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
 
// ── Validation ────────────────────────────────────────────────────────────────
// We validate on the frontend before hitting the API.
// This mirrors the backend DTO rules exactly so the user gets
// instant feedback on the right field rather than a generic top alert.
 
interface FormErrors {
  title?: string;
  amount?: string;
}
 
function validateForm(title: string, amount: number | ""): FormErrors {
  const errors: FormErrors = {};
 
  if (!title.trim()) {
    errors.title = "Title is required";
  } else if (title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (title.trim().length > 200) {
    errors.title = "Title cannot exceed 200 characters";
  }
 
  if (amount === "" || amount === null || amount === undefined) {
    errors.amount = "Amount is required";
  } else if (Number(amount) <= 0) {
    errors.amount = "Amount must be greater than 0";
  } else if (Number(amount) > 10_000_000) {
    errors.amount = "Amount cannot exceed 10,000,000";
  }
 
  return errors;
}
 
// ── Component ─────────────────────────────────────────────────────────────────
 
export default function CreateRequest() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
 
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
 
  // Top-level API error (network failures, server errors, etc.)
  const [apiError, setApiError] = useState("");
 
  // Per-field inline errors — only shown after the user has touched a field
  // or after a failed save/submit attempt
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ title: false, amount: false });
 
  useEffect(() => {
    if (isEditMode) loadRequest();
  }, [id]);
 
  const loadRequest = async () => {
    try {
      const res = await api.get(`/requests/${id}`);
      setTitle(res.data.title);
      setDescription(res.data.description);
      setAmount(res.data.amount);
      setStatus(res.data.status);
    } catch (err) {
      console.error("Failed to load request", err);
    }
  };
 
  // Called when a field loses focus — shows its error immediately
  const handleBlur = (field: "title" | "amount") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validateForm(title, amount);
    setFieldErrors(errors);
  };
 
  // Called on every keystroke — only updates errors for fields already touched
  const revalidate = (newTitle: string, newAmount: number | "") => {
    if (touched.title || touched.amount) {
      setFieldErrors(validateForm(newTitle, newAmount));
    }
  };
 
  // ── Save Draft ──────────────────────────────────────────────────────────────
  // Validates first, marks all fields as touched so errors appear,
  // then calls the API only if valid.
 
  const handleSaveDraft = async () => {
    // Mark everything as touched so all errors become visible
    setTouched({ title: true, amount: true });
    const errors = validateForm(title, amount);
    setFieldErrors(errors);
 
    if (Object.keys(errors).length > 0) return; // stop — show inline errors
 
    setLoading(true);
    setApiError("");
 
    try {
      if (isEditMode) {
        await api.put(`/requests/${id}`, { title, description, amount });
      } else {
        await api.post("/requests", { title, description, amount });
      }
      navigate("/requests");
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Error saving draft");
    } finally {
      setLoading(false);
    }
  };
 
  // ── Submit ──────────────────────────────────────────────────────────────────
  // FIX: In edit mode, always PUT the latest form values first,
  // THEN call /submit. Previously it skipped the PUT entirely in edit mode,
  // so submitting always used the old saved values from the DB.
 
  const handleSubmit = async () => {
    // Same validation as Save Draft
    setTouched({ title: true, amount: true });
    const errors = validateForm(title, amount);
    setFieldErrors(errors);
 
    if (Object.keys(errors).length > 0) return;
 
    setLoading(true);
    setApiError("");
 
    try {
      let requestId = id;
 
      if (isEditMode) {
        // ✅ FIXED: always save the latest field values before submitting
        await api.put(`/requests/${id}`, { title, description, amount });
      } else {
        // Create mode: create first, then submit
        const res = await api.post("/requests", { title, description, amount });
        requestId = res.data.requestId;
      }
 
      await api.post(`/requests/${requestId}/submit`);
      navigate("/requests");
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Error submitting request");
    } finally {
      setLoading(false);
    }
  };
 
  // ── Render ──────────────────────────────────────────────────────────────────
 
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper
        sx={{
          p: 5,
          borderRadius: 3,
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          background: "linear-gradient(145deg, #fefefe, #f2f2f2)",
          transition: "all 0.3s ease",
          "&:hover": { boxShadow: "0 12px 30px rgba(0,0,0,0.2)" },
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, mb: 3, textAlign: "center", color: "#333" }}
        >
          {isEditMode ? "Edit Draft" : "Create Request"}
        </Typography>
 
        {/* Top-level API error only — field errors are shown inline below */}
        {apiError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {apiError}
          </Alert>
        )}
 
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              revalidate(e.target.value, amount);
            }}
            onBlur={() => handleBlur("title")}
            // error + helperText turns the field red and shows the message
            error={touched.title && Boolean(fieldErrors.title)}
            helperText={touched.title && fieldErrors.title}
            inputProps={{ maxLength: 201 }} // let them type past 200 so the error shows
            sx={{
              "& .MuiInputBase-root": { borderRadius: 2, backgroundColor: "#fff" },
            }}
          />
 
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            inputProps={{ maxLength: 2000 }}
            sx={{
              "& .MuiInputBase-root": { borderRadius: 2, backgroundColor: "#fff" },
            }}
          />
 
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="normal"
            value={amount}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setAmount(val);
              revalidate(title, val);
            }}
            onBlur={() => handleBlur("amount")}
            error={touched.amount && Boolean(fieldErrors.amount)}
            helperText={touched.amount && fieldErrors.amount}
            inputProps={{ min: 0.01, max: 10_000_000 }}
            sx={{
              "& .MuiInputBase-root": { borderRadius: 2, backgroundColor: "#fff" },
            }}
          />
 
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleSaveDraft}
              disabled={loading}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                color: "#555",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
              }}
            >
              Save Draft
            </Button>
 
            {(status === "Draft" || !isEditMode) && (
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a0ebd, #1e5fd3)",
                  },
                }}
              >
                Submit
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}