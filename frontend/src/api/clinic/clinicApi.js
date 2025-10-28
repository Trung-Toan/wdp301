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

    /**
     * Lấy thông tin chi tiết clinic
     * @param {string} clinicId - ID của clinic
     * @returns {Promise} - Thông tin chi tiết clinic bao gồm specialties, rating, doctor_count, v.v.
     */
    getClinicDetail: (clinicId) => axiosInstance.get(`/clinic/${clinicId}`),

    /**
     * Lấy danh sách bác sĩ của clinic
     * @param {string} clinicId - ID của clinic
     * @param {Object} params - các tham số query
     * @param {string} [params.specialtyId] - Lọc theo chuyên khoa
     * @param {number} [params.page=1] - Trang hiện tại
     * @param {number} [params.limit=20] - Số lượng bác sĩ mỗi trang
     * @returns {Promise} - { data: [], meta: { total, page, limit, totalPages } }
     */
    getClinicDoctors: (clinicId, params) => axiosInstance.get(`/clinic/${clinicId}/doctors`, { params }),

    /**
     * Lấy reviews/đánh giá của clinic
     * @param {string} clinicId - ID của clinic
     * @param {Object} params - các tham số query
     * @param {number} [params.page=1] - Trang hiện tại
     * @param {number} [params.limit=20] - Số lượng reviews mỗi trang
     * @returns {Promise} - { data: [], meta: { total, page, limit, totalPages } }
     */
    getClinicReviews: (clinicId, params) => axiosInstance.get(`/clinic/${clinicId}/reviews`, { params }),
};
