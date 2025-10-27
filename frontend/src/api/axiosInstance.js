import axios from "axios";

export const baseURL = "http://localhost:5000/api";

export const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use((config) => {
    // Try both possible token keys
    const token = sessionStorage.getItem("accessToken") || sessionStorage.getItem("token");
    if (token) {
        // Clean token and add Bearer prefix
        const cleanToken = token.replace(/^"|"$/g, "");
        config.headers.Authorization = `Bearer ${cleanToken}`;
        console.log('Axios interceptor - Adding token to request:', cleanToken.substring(0, 50) + '...');
    }
    return config;
});

// Bắt lỗi chung
axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("API Error:", err.response?.data || err.message);
        return Promise.reject(err);
    }
);
