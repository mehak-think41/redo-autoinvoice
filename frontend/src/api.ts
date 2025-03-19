import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for cookies
});

// Get authentication URL
export const getGoogleAuthUrl = async () => {
    const response = await api.get("/auth/google/url");
    return response.data.url;
};


// Get current user
export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data.user;
};

// Get authentication URL
export const getGoogleInbox = async () => {
    const response = await api.get("/users/google/gmail");
    return response.data.emails;
};

export const watchLive = async () => {
    const response = await api.post("/users/watchlive");
    return response.data.message;
};
// Logout
export const logout = async () => {
    await api.post("/auth/logout");
};
