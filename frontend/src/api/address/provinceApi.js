import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/locations",
});

export const provinceApi = {
    getProvinces: (params) => api.get("/provinces/options", { params }),
};
