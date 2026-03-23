import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { JSX } from "react";

interface Props {
  children: JSX.Element;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { token, activeRole } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && (!activeRole || !roles.includes(activeRole))) {
    return <Navigate to="/requests" replace />;
  }

  return children;
}