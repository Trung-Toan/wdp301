import { axiosInstance } from "../axiosInstance";

export const appointmentApi = {
    getAllAppointmentOfPatient: (patientId, { status, page = 1, limit = 10 } = {}) =>
        axiosInstance.get(`appointments/patient/${patientId}`, {
            params: { status, page, limit },
        }),
};
