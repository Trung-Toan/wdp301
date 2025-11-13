import { axiosInstance } from "../axiosInstance";

export const complaintApi = {
    /**
     * Tạo khiếu nại mới
     * @param {Object} data - Dữ liệu khiếu nại
     * @param {string} data.title - Tiêu đề khiếu nại
     * @param {string} data.content - Nội dung khiếu nại
     * @param {string} data.complaint_type - Loại khiếu nại (DOCTOR hoặc CLINIC)
     * @param {string} [data.doctor_id] - ID bác sĩ (bắt buộc nếu complaint_type = DOCTOR)
     * @param {string} [data.clinic_id] - ID phòng khám (bắt buộc nếu complaint_type = CLINIC)
     * @param {string} [data.appointment_id] - ID lịch hẹn (tùy chọn)
     * @param {string[]} [data.evidence] - Mảng URL bằng chứng (tùy chọn)
     * @returns {Promise}
     */
    createComplaint: (data) => axiosInstance.post("/patient/complaints", data),

    /**
     * Lấy danh sách khiếu nại của bệnh nhân
     * @param {Object} params - Query parameters
     * @param {number} [params.page=1] - Số trang
     * @param {number} [params.limit=10] - Số lượng khiếu nại mỗi trang
     * @param {string} [params.status] - Lọc theo trạng thái (PENDING, IN_REVIEW, RESOLVED, DISMISSED)
     * @param {string} [params.complaint_type] - Lọc theo loại (DOCTOR, CLINIC)
     * @returns {Promise}
     */
    getComplaints: (params = {}) => axiosInstance.get("/patient/complaints", { params }),

    /**
     * Lấy chi tiết khiếu nại
     * @param {string} complaintId - ID khiếu nại
     * @returns {Promise}
     */
    getComplaintById: (complaintId) => axiosInstance.get(`/patient/complaints/${complaintId}`),
};

