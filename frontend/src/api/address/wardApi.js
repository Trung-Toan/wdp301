import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/locations",
});

export const wardApi = {
    getWardsByProvince: (provinceCode, params) =>
        api.get(`/provinces/${provinceCode}/wards`, { params }),
};
