import { axiosInstance } from "../axiosInstance";

export const medicalRecordPatientApi = {
    // Lấy danh sách hồ sơ của bệnh nhân
    getListMedicalRecordsByPatientId: (patientId) =>
        axiosInstance.get(`/appointments/patient/${patientId}`),

    getListMedicalRecords: ({ page = 1, limit = 20 } = {}) =>
        axiosInstance.get("/patient/records", {
            params: { page, limit },
        }),

    getMedicalRecordsById: (id) =>
        axiosInstance.get(`/patient/records/${id}`),

    updateAccessRequest: (recordId, requestId, action) =>
        axiosInstance.put(`/patient/records/${recordId}/access/${requestId}`, { action }),

};

