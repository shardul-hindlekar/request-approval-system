import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import CreateRequest from "./requests/CreateRequest";
import RequestList from "./requests/RequestList";
import AppLayout from "./components/AppLayout";
import RequestDetails from "./requests/RequestDetails";
import AdminPage from "./pages/AdminPage";
import AdminAuditPage from "./pages/AdminAuditPage";
import ChangePassword from "./pages/ChangePassword";


function RootRedirect() {
  const { token } = useAuth();
  return token
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/roles"
            element={
              <ProtectedRoute>
                <RoleSelectionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RequestList />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests/view/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RequestDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests/create"
            element={
              <ProtectedRoute roles={["Requester"]}>
                <AppLayout>
                  <CreateRequest />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests/edit/:id"
            element={
              <ProtectedRoute roles={["Requester"]}>
                <AppLayout>
                  <CreateRequest />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AppLayout>
                  <AdminPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AppLayout>
                  <AdminAuditPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ChangePassword />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}