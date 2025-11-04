// import { updateAppointment } from "../../../../backend/src/service/appointment/appointment.service";
import { axiosInstance } from "../axiosInstance";

export const PATIENT_API = {
    GET_LIST_PATIENT: "/assistant/patients",
    GET_APPOINTMENT_BY_PATIENT_ID: (appointmentId) => `/assistant/patients/${appointmentId}`,
    /*************  ``✨ Windsurf Command ⭐  *************/
    /**
     * Lấy danh sách bệnh nhân của trợ lý
     * @param {number} [page=1] - Trang hiện tại
     * @param {number} [limit=10] - Số lượng bệnh nhân trên 1 trang
     * @param {string} [search=""] - Chuỗi tìm kiếm bệnh nhân
     * @returns {Promise<AxiosResponse>}
     */
    /*******  6d438b75-74c2-4aa6-88bf-695a5da5f9e3 *******/
    getListPatient: (page = 1, limit = 10, search = "") => axiosInstance.get(PATIENT_API.GET_LIST_PATIENT, { params: { page, limit, search } }),

    /**
     * Lấy thông tin bệnh nhân theo ID
     * @param {number} appointmentId - ID của lịch khám 
     * @returns {Promise<AxiosResponse>}
     */
    getAppointmentByPatientId: (appointmentId) => axiosInstance.get(PATIENT_API.GET_APPOINTMENT_BY_PATIENT_ID(appointmentId)),

};

export const MEDICAL_RECORD_API = {
    GET_LIST_MEDICAL_RECORDS: "/assistant/created/medical-records",
    CREATE_MEDICAL_RECORD: (appointmentId) => `/assistant/medical-records/appointment/${appointmentId}`,
    /**
     * Lấy danh sách hồ sơ bệnh án do trợ lý tạo
     * @param {number} [page=1] - Trang hiện tại
     * @returns {Promise<AxiosResponse>}
     */
    getListMedicalRecords: (page = 1) => axiosInstance.get(MEDICAL_RECORD_API.GET_LIST_MEDICAL_RECORDS, { params: { page } }),

    createMedicalRecord: (appointmentId, data) => axiosInstance.post(MEDICAL_RECORD_API.CREATE_MEDICAL_RECORD(appointmentId), data),

};

export const APPOINTMENT_API = {
    GET_LIST_APPOINTMENTS: "/assistant/appointments",
    GET_APPOINTMENT_BY_ID: (appointmentId) => `/assistant/appointments/${appointmentId}`,
    VERIFY_APPOINTMENT: (appointmentId) => `/assistant/verify/appointments/${appointmentId}`,
    UPDATE_APPOINTMENT: (appointmentId) => `/assistant/update/appointments/${appointmentId}`,


    getListAppointments: (page = 1, limit = 10, status = "", slot = "", search = "", date = "") => axiosInstance.get(APPOINTMENT_API.GET_LIST_APPOINTMENTS, { params: { page, limit, status, slot, search, date } }),

    getAppointmentById: (appointmentId) => axiosInstance.get(APPOINTMENT_API.GET_APPOINTMENT_BY_ID(appointmentId)),

    verifyAppointment: (appointmentId, status) =>
        // Thay thế 'null' bằng một đối tượng rỗng '{}'
        axiosInstance.put(APPOINTMENT_API.VERIFY_APPOINTMENT(appointmentId), {}, { params: { status } }),

    updateAppointment: (appointmentId, data) => axiosInstance.put(APPOINTMENT_API.UPDATE_APPOINTMENT(appointmentId), data),

};

export const SLOT_API = {
    GET_SLOTS_BY_DOCTOR: `/assistant/slots/doctor`,
    GET_DETAILS_SLOT: (slotId) => `/assistant/slots/${slotId}`,
    UPDATE_SLOT_BY_ID: (slotId) => `/assistant/slots/${slotId}/doctor`,
    CREATE_SLOT_BY_DOCTOR: "/assistant/slots/doctor",

    createSlotByDoctor: (data) => axiosInstance.post(SLOT_API.CREATE_SLOT_BY_DOCTOR, data),

    getSlotsByDoctor: (date = new Date()) => axiosInstance.get(SLOT_API.GET_SLOTS_BY_DOCTOR, { params: { date } }),

    getDetailsSlot: (slotId) => axiosInstance.get(SLOT_API.GET_DETAILS_SLOT(slotId)),

    updateSlotById: (slotId, data) => {
        console.log("Updating slot with data:", data);
        return axiosInstance.put(SLOT_API.UPDATE_SLOT_BY_ID(slotId), data);
    }
};

