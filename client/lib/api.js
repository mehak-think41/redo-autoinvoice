import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response || error);
    return Promise.reject(error);
  }
);

// Get Google authentication URL
export const getGoogleAuthUrl = async () => {
  try {
    const response = await api.get("/auth/google/url");
    return response.data.url;
  } catch (error) {
    console.error("Error getting Google auth URL:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

// Watch live - call the watchlive endpoint
export const watchLive = async () => {
  try {
    const response = await api.post("/users/watchlive");
    return response.data.message;
  } catch (error) {
    console.error("Error calling watchlive:", error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

export const getProcessedInvoices = async () => {
  const response = await api.get("/doc?status=Approved");
  return response.data;
};

export const getPendingInvoices = async () => {
  const response = await api.get(`/doc?status=Pending&status=Flagged`);
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await api.get(`/doc/${id}`);
  return response.data;
};

export const getMonthlyInvoiceStats = async () => {
  const response = await api.get("/doc/stats/monthly");
  return response.data;
};

export const updateInvoiceStatus = async (invoiceId, action) => {
  try {
    const response = await api.post('/doc/update-status', {
      invoiceId,
      action
    });
    if (!response.data.success) {
      throw new Error(response.data.message || `Error ${action.toLowerCase()}ing invoice`);
    }
    return response.data;
  } catch (error) {
    console.error(`Error ${action.toLowerCase()}ing invoice:`, error);
    throw error.response?.data || error;
  }
};