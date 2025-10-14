import axios from "axios";

export const baseURL = "http://localhost:5000/api";

export const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Bắt lỗi chung
axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("API Error:", err.response?.data || err.message);
        return Promise.reject(err);
    }
);
