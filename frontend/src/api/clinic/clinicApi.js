// src/api/clinic.js
import { axiosInstance } from "../axiosInstance";

export const clinicApi = {
    /**
     * Gọi API tìm kiếm phòng khám theo bộ lọc
     * @param {Object} params - các tham số lọc
     * @param {string} [params.provinceCode]
     * @param {string} [params.wardCode]
     * @param {string} [params.specialtyId]
     * @param {string} [params.q]
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @param {string} [params.sort="-createdAt"]
     */
    searchClinics: (params) => axiosInstance.get("/clinic/search", { params }),

    getAllClinic: () => axiosInstance.get("/clinic/allClinic"),
};
