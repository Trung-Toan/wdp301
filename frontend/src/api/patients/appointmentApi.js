import { axiosInstance } from "../axiosInstance";

export const appointmentApi = {

    getAllAppointmentOfPatient: (patientId) =>
        axiosInstance.get(`appointments/patient/${patientId}`),
};

