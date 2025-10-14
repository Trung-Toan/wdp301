import axios from "axios";

export const baseURL = "http://localhost:5000/api";

export const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
  (config) => {
    let token = sessionStorage.getItem("token");

    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1); // loại bỏ dấu ngoặc kép
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Bắt lỗi chung
axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("API Error:", err.response?.data || err.message);
        return Promise.reject(err);
    }
);
