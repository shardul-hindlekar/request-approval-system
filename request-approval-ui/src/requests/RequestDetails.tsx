import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { useParams, useNavigate, useLocation  } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import type { RequestDetailDto, AuditLogDto } from "../types";


export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<RequestDetailDto | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogDto[]>([]);

  const location = useLocation();
  const from = location.state?.from;

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const res = await api.get(`/requests/${id}`);
    setData(res.data);

    const auditRes = await api.get(`/requests/${id}/audit`);
    setAuditLogs(auditRes.data);
  };

  if (!data) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Request Details
          </Typography>
          <Button
  onClick={() => {
    if (from === "dashboard") navigate("/dashboard");
    else navigate("/requests");
  }}
>
  Back
</Button>
        </Stack>

        <Box sx={{ lineHeight: 1.8 }}>
          <Typography><strong>Title:</strong> {data.title}</Typography>
          <Typography><strong>Description:</strong> {data.description}</Typography>
          <Typography><strong>Amount:</strong> {data.amount}</Typography>
          <Typography><strong>Status:</strong> {data.status}</Typography>
        </Box>
      </Paper>

      {/* 🔥 AUDIT SECTION */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Activity History
        </Typography>

        {auditLogs.map((log) => (
          <Box key={log.auditLogId} sx={{ mb: 2 }}>
            <Typography fontWeight={600}>
              {log.action}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              User: <b>{log.username}</b> | Role: {log.actionByRole} | {new Date(log.actionDate).toLocaleString()}
            </Typography>

            {log.comments && (
              <Typography sx={{ mt: 1 }}>
                Comment: {log.comments}
              </Typography>
            )}

            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}

        {auditLogs.length === 0 && (
          <Typography>No activity yet.</Typography>
        )}
      </Paper>
    </Container>
  );
}