import {
  Container,
  Typography,
  Paper,
  Box,
  InputAdornment,
  TextField,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import api from "../api/axios";

// CHANGE: added username field to the interface
interface AuditLog {
  auditLogId: number;
  requestId: number;
  action: string;
  actionByUserId: number;
  username: string;        // ← NEW
  actionByRole: string;
  actionDate: string;
  comments?: string | null;
}

export default function AdminAuditPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get<AuditLog[]>("/admin/audit");
        setRows(res.data);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // CHANGE: added username to search filter
  const filteredRows = useMemo(() => {
    return rows.filter(
      (r) =>
        r.action.toLowerCase().includes(searchText.toLowerCase()) ||
        r.actionByRole.toLowerCase().includes(searchText.toLowerCase()) ||
        r.username.toLowerCase().includes(searchText.toLowerCase()) ||  // ← NEW
        (r.comments ?? "").toLowerCase().includes(searchText.toLowerCase()) ||
        r.requestId.toString().includes(searchText)
    );
  }, [rows, searchText]);

  // CHANGE: added username column between Role and Date
  const columns: GridColDef<AuditLog>[] = [
    { field: "requestId", headerName: "Request ID", width: 110 },
    { field: "action", headerName: "Action", flex: 1 },
    { field: "username", headerName: "User", width: 140 },       // ← NEW
    { field: "actionByRole", headerName: "Role", width: 130 },
    {
      field: "actionDate",
      headerName: "Date",
      width: 180,
      renderCell: (params) =>
        params.value
          ? new Date(params.value as string).toLocaleString()
          : "",
    },
    { field: "comments", headerName: "Comments", flex: 1 },
  ];

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h5" mb={3} fontWeight="bold">
        System Audit Logs
      </Typography>

      {/* CHANGE: updated placeholder to mention username */}
      <TextField
        placeholder="Search by request ID, user, action, role, or comments..."
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Paper elevation={6} sx={{ p: 2, borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ height: "650px", width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.auditLogId}
            pagination
            autoHeight
            loading={loading}
            pageSizeOptions={[10]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </Container>
  );
}