import { axiosInstance } from "../axiosInstance";

export const appointmentApi = {
    /**
     * Lấy danh sách appointments của bệnh nhân
     * @param {string} patientId - ID của bệnh nhân
     * @param {Object} params - Query parameters
     * @returns {Promise}
     */
    getAllAppointmentOfPatient: (patientId, { status, page = 1, limit = 10 } = {}) =>
        axiosInstance.get(`appointments/patient/${patientId}`, {
            params: { status, page, limit },
        }),

    /**
     * Tạo appointment mới (đặt lịch khám)
     * @param {Object} data - Dữ liệu đặt lịch
     * @param {string} data.slot_id - ID của slot
     * @param {string} data.doctor_id - ID của bác sĩ
     * @param {string} data.patient_id - ID của bệnh nhân
     * @param {string} data.specialty_id - ID của chuyên khoa
     * @param {string} data.clinic_id - ID của phòng khám
     * @param {string} data.scheduled_date - Ngày khám (YYYY-MM-DD)
     * @param {string} data.full_name - Họ tên
     * @param {string} data.phone - Số điện thoại
     * @param {string} data.email - Email
     * @param {string} [data.reason] - Lý do khám
     * @returns {Promise} - Appointment data với notification_created flag
     */
    createAppointment: (data) => axiosInstance.post("/appointments", data),

    /**
     * Lấy chi tiết appointment
     * @param {string} appointmentId - ID của appointment
     * @returns {Promise}
     */
    getAppointmentById: (appointmentId) => axiosInstance.get(`/appointments/${appointmentId}`),

    /**
     * Lấy các slots available của bác sĩ trong ngày
     * @param {string} doctorId - ID của bác sĩ
     * @param {string} date - Ngày cần check (YYYY-MM-DD)
     * @returns {Promise} - Danh sách slots available
     */
    getAvailableSlots: (doctorId, date) =>
        axiosInstance.get(`/appointments/doctors/${doctorId}/slots/available`, {
            params: { date },
        }),

    /**
     * Kiểm tra slot availability
     * @param {string} slotId - ID của slot
     * @param {string} scheduledDate - Ngày đặt (YYYY-MM-DD)
     * @param {string} [patientId] - ID của bệnh nhân (optional)
     * @returns {Promise} - { canBook, reason, bookedCount, maxPatients, remainingSlots }
     */
    checkSlotAvailability: (slotId, scheduledDate, patientId) =>
        axiosInstance.get(`/appointments/slots/${slotId}/check-availability`, {
            params: { scheduledDate, patientId },
        }),
};
