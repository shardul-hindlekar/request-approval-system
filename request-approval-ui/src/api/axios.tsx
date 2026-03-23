import axios from "axios";
import { config } from "process";

const api = axios.create({
    baseURL: "https://localhost:7294/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const activeRole = localStorage.getItem("activeRole");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (activeRole) {
        config.headers["X-Active-Role"] = activeRole;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect for pages other than /login
        const isLoginPage = window.location.pathname === "/login";

        if(error.response?.status === 401 && !isLoginPage){
            localStorage.removeItem("token");
            localStorage.removeItem("roles");
            localStorage.removeItem("username");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;