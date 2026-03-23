import { Container, Typography, Box, Paper, Snackbar, Alert } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusChip from "../components/StatusChip";
import { useAuth } from "../auth/AuthContext";
import ActionButtons from "./ActionButtons";
import { RequestDto } from "./types";

export default function RequestList() {
  const [rows, setRows] = useState<RequestDto[]>([]);
  const { activeRole } = useAuth();

  const loadData = () => {
    api.get("/requests").then((res) => {
      setRows(res.data);
    });
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    loadData();
  }, []);

  const columns: GridColDef[] = [
    { field: "requestId", headerName: "ID", width: 80 },
    { field: "title", headerName: "Title", flex: 1, minWidth: 200 },
    { field: "amount", headerName: "Amount", width: 140 },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    { field: "createdBy", headerName: "Created By", width: 160 },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => (
        <ActionButtons
          role={activeRole}
          status={params.row.status}
          requestId={params.row.requestId}
          refresh={loadData}
          showMessage={(msg, type) =>
            setSnackbar({ open: true, message: msg, severity: type })
          }
        />
      ),
    },
  ];

  return (
    <Container sx={{ mt: 8 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333", mb: 2 }}
      >
        Requests
      </Typography>

      <Paper
        elevation={6}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          p: 2,
          backgroundColor: "#fefefe",
        }}
      >
        <Box
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
              fontSize: 15,
              color: "#333",
              backgroundColor: "#fff",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #eee",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: 600,
              fontSize: 15,
              borderBottom: "1px solid #ddd",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(0,0,0,0.03)",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #eee",
              fontSize: 14,
            },
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.requestId}
            pagination
            autoHeight
            disableRowSelectionOnClick
             pageSizeOptions={[5]}
             initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
          />
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}