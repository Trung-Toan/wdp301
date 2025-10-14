import { axiosInstance } from "../axiosInstance";

export const wardApi = {
    getWardsByProvince: (provinceCode, params) =>
        axiosInstance.get(`/locations/provinces/${provinceCode}/wards`, { params }),
};
