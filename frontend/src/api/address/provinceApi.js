import { axiosInstance } from "../axiosInstance";

export const provinceApi = {
    getProvinces: (params) =>
        axiosInstance.get("/locations/provinces/options", { params }),
};
