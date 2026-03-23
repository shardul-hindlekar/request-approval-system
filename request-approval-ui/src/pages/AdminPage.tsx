import {
  Button,
  Container,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Box,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import UserModal from "../components/UserModal";
import { UserDto } from "../types";

export default function AdminPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);

  const [tabValue, setTabValue] = useState(0);
  const [searchText, setSearchText] = useState("");

  const activeUsers = users.filter((u) => u.isActive);
  const inactiveUsers = users.filter((u) => !u.isActive);

  const filteredActiveUsers = useMemo(() => {
    return activeUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(searchText.toLowerCase()) ||
        u.roles.some((r: string) =>
          r.toLowerCase().includes(searchText.toLowerCase())
        )
    );
  }, [activeUsers, searchText]);

  const filteredInactiveUsers = useMemo(() => {
    return inactiveUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(searchText.toLowerCase()) ||
        u.roles.some((r: string) =>
          r.toLowerCase().includes(searchText.toLowerCase())
        )
    );
  }, [inactiveUsers, searchText]);

  const handleReactivate = async (userId: number) => {
    try {
      await api.put(`/admin/reactivate/${userId}`);
      loadUsers();
      setSuccessMessage("User reactivated successfully");
    } catch {
      setSuccessMessage("Error reactivating user");
    }
  };

  const loadUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data);
    return res.data;
  };

  const handleSaved = async (message: string) => {
    await loadUsers();
    setTabValue(0);
    setSuccessMessage(message);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/${userToDelete.userId}`);
      loadUsers();
      setSuccessMessage("User deleted successfully");
    } catch {
      setSuccessMessage("Error deleting user");
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const columns: GridColDef[] = [
    { field: "userId", headerName: "ID", width: 80 },
    { field: "username", headerName: "Username", flex: 1 },
    {
      field: "roles",
      headerName: "Roles",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {params.value.join(", ")}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {params.row.isActive ? (
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setEditingUser(params.row);
                  setModalOpen(true);
                }}
              >
                Edit
              </Button>

              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => {
                  setUserToDelete(params.row);
                  setDeleteConfirmOpen(true);
                }}
              >
                Delete
              </Button>
            </>
          ) : (
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => handleReactivate(params.row.userId)}
            >
              Reactivate
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 10 }}>
      <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
        <CardContent>
          {/* Header Section */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={600}>
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage system users and their roles
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="medium"
              sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
              onClick={() => {
                setEditingUser(null);
                setModalOpen(true);
              }}
            >
              + Create User
            </Button>
          </Stack>

          {/* Search Box */}
          <TextField
            placeholder="Search by username or role..."
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Active Users" />
            <Tab label="Inactive Users" />
          </Tabs>

          {/* DataGrid */}
          <Box sx={{ borderRadius: 2, overflow: "hidden" }}>
            <DataGrid
              rows={tabValue === 0 ? filteredActiveUsers : filteredInactiveUsers}
              columns={columns}
              getRowId={(row) => row.userId}
              autoHeight
              disableRowSelectionOnClick
              pagination
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5", fontWeight: 600 },
                "& .MuiDataGrid-row:hover": { backgroundColor: "#fafafa" },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* USER MODAL */}
      {modalOpen && (
        <UserModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={(message) => {
            setModalOpen(false);
            handleSaved(message);
          }}
          user={editingUser ?? undefined}
        />
      )}

      {/* DELETE CONFIRMATION */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary" }}>
            Are you sure you want to delete <strong>{userToDelete?.username}</strong>?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            sx={{ textTransform: "none", borderRadius: 2 }}
            onClick={handleDeleteConfirm}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}