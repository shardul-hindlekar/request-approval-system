import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Menu,
    MenuItem,
    Divider
} from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

interface NavItem {
    label: string;
    path: string;
    roles?: string[];
    hideFor?: string[];
}

export default function Navbar() {
    const { logout, roles, activeRole, username } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // get current path

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleChangePassword = () => {
        navigate("/change-password");
        handleMenuClose();
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSwitchRole = () => {
        navigate("/roles");
        handleMenuClose();
    };

    const navItems: NavItem[] = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Requests", path: "/requests", hideFor: ["Admin"] },
        { label: "Create", path: "/requests/create", roles: ["Requester"] },
        { label: "Admin", path: "/admin", roles: ["Admin"] },
        { label: "Audit", path: "/admin/audit", roles: ["Admin"] },
    ];

    // Determine if button is active
    const isActive = (path: string) => location.pathname === path;

    return (
        <AppBar
            position="fixed"
            elevation={6}
            sx={{
                background: "linear-gradient(135deg, #2c3e50, #34495e)", // dark gradient
                color: "#f1f1f1",
                boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
            }}
        >
            <Toolbar sx={{ minHeight: 64, px: 4 }}>
                {/* TITLE */}
                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "#f1f1f1",
                    }}
                >
                    Request Approval System
                </Typography>

                {/* ACTIVE ROLE BADGE */}
                {activeRole && (
                    <Box
                        sx={{
                            mx: 2,
                            backgroundColor: "#f39c12",
                            color: "#fff",
                            px: 2,
                            py: 0.5,
                            borderRadius: "999px",
                            fontWeight: 500,
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                    >
                        {activeRole}
                    </Box>
                )}

                {/* NAV BUTTONS */}
                {navItems.map((btn) => {
                    if (btn.roles && !btn.roles.includes(activeRole ?? "")) return null;
                    if (btn.hideFor && btn.hideFor.includes(activeRole ?? "")) return null;

                    const active = isActive(btn.path);
                    return (
                        <Button
                            key={btn.path}
                            onClick={() => navigate(btn.path)}
                            sx={{
                                fontSize: "0.95rem",
                                textTransform: "none",
                                ml: 1,
                                color: active ? "#f39c12" : "#f1f1f1", // highlight active page
                                fontWeight: active ? 600 : 400,
                                backgroundColor: active ? "rgba(243, 156, 18, 0.15)" : "transparent",
                                borderRadius: 1,
                                "&:hover": {
                                    backgroundColor: active ? "rgba(243, 156, 18, 0.25)" : "rgba(255,255,255,0.1)",
                                },
                            }}
                        >
                            {btn.label}
                        </Button>
                    );
                })}

                {/* USER DROPDOWN */}
                {username && (
                    <Button
                        onClick={handleMenuOpen}
                        sx={{
                            fontSize: "0.95rem",
                            textTransform: "none",
                            ml: 2,
                            color: "#f1f1f1",
                        }}
                    >
                        Welcome, {username}
                    </Button>
                )}

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            borderRadius: 2,
                            minWidth: 180,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                        },
                    }}
                >
                    {roles.length > 1 && (
                        <MenuItem
                            onClick={handleSwitchRole}
                            sx={{ fontSize: "0.9rem" }}
                        >
                            Switch Role
                        </MenuItem>
                    )}

                    <MenuItem
                        onClick={handleChangePassword}
                        sx={{ fontSize: "0.9rem" }}
                    >
                        Change Password
                    </MenuItem>

                    <Divider />

                    <MenuItem
                        onClick={() => {
                            handleLogout();
                            handleMenuClose();
                        }}
                        sx={{ fontSize: "0.9rem" }}
                    >
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}