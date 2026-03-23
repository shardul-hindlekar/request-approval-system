import { createContext, useContext, useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface AuthContextType {
  token: string | null;
  roles: string[];
  activeRole: string | null;
  username: string | null;
  login: (token: string, roles: string[], username: string) => void;
  logout: () => void;
  setActiveRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [roles, setRoles] = useState<string[]>(() => {
    const saved = localStorage.getItem("roles");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeRole, setActiveRoleState] = useState<string | null>(() => localStorage.getItem("activeRole"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("username"));

  // Modal state
  const [showModal, setShowModal] = useState(false);

  const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes
  const WARNING_TIME = 30 * 1000; // 30 seconds warning

  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const logoutTimer = useRef<NodeJS.Timeout | null>(null);

  // Reset timers on activity
  const resetTimer = () => {
    if (!token) return;

    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    setShowModal(false);

    // Show modal 30 seconds before logout
    inactivityTimer.current = setTimeout(() => {
      setShowModal(true);

      logoutTimer.current = setTimeout(() => {
        logout();
        window.location.href = "/login";
      }, WARNING_TIME);
    }, INACTIVITY_LIMIT - WARNING_TIME);
  };

  // Setup event listeners
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];

    events.forEach((event) => document.addEventListener(event, resetTimer));

    resetTimer(); // initialize timer

    return () => {
      events.forEach((event) => document.removeEventListener(event, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [token]);

  const login = (token: string, roles: string[], username: string) => {
    setToken(token);
    setRoles(roles);
    setUsername(username);

    localStorage.setItem("token", token);
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("username", username);

    resetTimer();
  };

  const logout = () => {
    setToken(null);
    setRoles([]);
    setActiveRoleState(null);
    setUsername(null);

    localStorage.clear();
    setShowModal(false);
  };

  const setActiveRole = (role: string) => {
    setActiveRoleState(role);
    localStorage.setItem("activeRole", role);
  };

  const stayLoggedIn = () => {
    setShowModal(false);
    resetTimer();
  };

  return (
    <AuthContext.Provider value={{ token, roles, activeRole, username, login, logout, setActiveRole }}>
      {children}

      {/* Inactivity Modal */}
      <Dialog open={showModal}>
        <DialogTitle>Inactive Session</DialogTitle>
        <DialogContent>
          <Typography>You will be logged out in 30 seconds due to inactivity.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={stayLoggedIn} variant="contained" color="primary">
            Stay Logged In
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}