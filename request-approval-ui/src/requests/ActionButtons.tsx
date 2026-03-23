import { Button, Stack } from "@mui/material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

interface Props {
  role: string | null;
  status: string;
  requestId: number;
  refresh: () => void;
  showMessage: (msg: string, type: "success" | "error") => void;
}

export default function ActionButtons({
  role,
  status,
  requestId,
  refresh,
  showMessage,
}: Props) {
  const navigate = useNavigate();

  const handleEdit = () => navigate(`/requests/edit/${requestId}`);
  const handleView = () => navigate(`/requests/view/${requestId}`);

  const viewButton = (
    <Button
      size="small"
      variant="outlined"
      onClick={handleView}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 500,
        borderColor: "#999",
        color: "#555",
        "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
      }}
    >
      View
    </Button>
  );

  const handleSendBack = async () => {
    try {
      await api.post(`/requests/${requestId}/send-back`, {
        comments: "Sent back by reviewer",
      });
      showMessage("Request sent back successfully", "success");
      refresh();
    } catch {
      showMessage("Failed to send back request", "error");
    }
  };

  const handleSubmitApproval = async () => {
    try {
      await api.post(`/requests/${requestId}/submit-approval`);
      showMessage("Request submitted for approval successfully", "success");
      refresh();
    } catch {
      showMessage("Failed to submit for approval", "error");
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/requests/${requestId}/approve`, { comments: "Approved" });
      showMessage("Request approved successfully", "success");
      refresh();
    } catch {
      showMessage("Failed to approve request", "error");
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/requests/${requestId}/reject`, { comments: "Rejected" });
      showMessage("Request rejected successfully", "success");
      refresh();
    } catch {
      showMessage("Failed to reject request", "error");
    }
  };

  // Role-based buttons
  if (role === "Requester" && status === "Draft") {
    return (
      <Button
        size="small"
        variant="outlined"
        onClick={handleEdit}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 500,
          borderColor: "#888",
          color: "#444",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
        }}
      >
        Edit
      </Button>
    );
  }

  if (role === "Reviewer" && status === "PendingReview") {
    return (
      <Stack direction="row" spacing={1}>
        {viewButton}
        <Button
          size="small"
          variant="contained"
          onClick={handleSubmitApproval}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            background: "linear-gradient(135deg, #6a11cb, #2575fc)",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a0ebd, #1e5fd3)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            },
          }}
        >
          Submit
        </Button>
        <Button
          size="small"
          color="warning"
          variant="outlined"
          onClick={handleSendBack}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            borderColor: "#ff9800",
            color: "#ff9800",
            "&:hover": { backgroundColor: "rgba(255,152,0,0.1)" },
          }}
        >
          Send Back
        </Button>
      </Stack>
    );
  }

  if (role === "Approver" && status === "PendingApproval") {
    return (
      <Stack direction="row" spacing={1}>
        {viewButton}
        <Button
          size="small"
          color="success"
          variant="contained"
          onClick={handleApprove}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.2)" },
          }}
        >
          Approve
        </Button>
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={handleReject}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            borderColor: "#f44336",
            color: "#f44336",
            "&:hover": { backgroundColor: "rgba(244,67,54,0.1)" },
          }}
        >
          Reject
        </Button>
      </Stack>
    );
  }

  return null;
}