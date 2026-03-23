import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Stack
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import StatusChip from "../components/StatusChip";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { exportToCsv, CsvColumn } from "../utils/exportCsv";
import DownloadIcon from "@mui/icons-material/Download";


interface DashboardRequest {
  requestId: number;
  title: string;
  amount: number;
  status: string;
  createdDate: string;
}

export default function Dashboard() {
  const [rows, setRows] = useState<DashboardRequest[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await api.get("/requests/completed");
    setRows(res.data);
  };
  const [searchText, setSearchText] = useState("");

  const filteredRows = useMemo(() => {
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(searchText.toLowerCase()) ||
        r.status.toLowerCase().includes(searchText.toLowerCase()) ||
        r.requestId.toString().includes(searchText)
    );
  }, [rows, searchText]);

  // ✅ Analytics Calculations
  const analytics = useMemo(() => {
    const total = rows.length;
    const approved = rows.filter((r) => r.status === "Approved");
    const rejected = rows.filter((r) => r.status === "Rejected");

    const totalApprovedAmount = approved.reduce(
      (sum, r) => sum + r.amount,
      0
    );

    return {
      total,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      totalApprovedAmount,
    };
  }, [rows]);

  const columns: GridColDef[] = [
    { field: "requestId", headerName: "ID", width: 80 },

    { field: "title", headerName: "Title", flex: 1 },

    { field: "amount", headerName: "Amount", width: 120 },

    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => <StatusChip status={params.value} />,
    },

    {
      field: "createdDate",
      headerName: "Created Date",
      width: 180,
      renderCell: (params) =>
        params.value
          ? new Date(params.value).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
          : "",
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() =>
            navigate(`/requests/view/${params.row.requestId}`, {
              state: { from: "dashboard" },
            })
          }
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  const csvColumns: CsvColumn<DashboardRequest>[] = [
    { header: "ID", key: "requestId" },
    { header: "Title", key: "title" },
    {
      header: "Amount",
      key: "amount",
      format: (v) => `$${Number(v).toLocaleString()}`,
    },
    { header: "Status", key: "status" },
    {
      header: "Created Date",
      key: "createdDate",
      format: (v) =>
        v ? new Date(v).toLocaleDateString(undefined, {
          year: "numeric", month: "short", day: "2-digit"
        })
          : "",
    },
  ];

  const handleExport = () => {
    exportToCsv("completed-requests", filteredRows, csvColumns);
  };


  return (
    <Container sx={{ mt: 8 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333", mb: 3 }}
      >
        Dashboard Analytics
      </Typography>

      {/* ✅ Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Completed
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {analytics.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Approved
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="green">
                {analytics.approvedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Rejected
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="red">
                {analytics.rejectedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Approved Amount
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                ${analytics.totalApprovedAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ✅ Data Table */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
          Completed Requests (Approved / Rejected)
        </Typography>

        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={filteredRows.length === 0}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Export CSV
        </Button>
      </Stack>

      <TextField
        placeholder="Search by request ID, title, or status..."
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

      <Paper
        elevation={6}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          p: 2,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Box
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
              fontSize: 14,
              color: "#444",
              backgroundColor: "#fff",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #eee",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#fafafa",
              fontWeight: "bold",
              borderBottom: "1px solid #ddd",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #eee",
            },
          }}
        >
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.requestId}
            pagination
            autoHeight
            disableRowSelectionOnClick
            rowHeight={60}
            columnHeaderHeight={60}
            pageSizeOptions={[5]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
}