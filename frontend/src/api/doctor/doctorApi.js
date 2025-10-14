import { axiosInstance } from "../axiosInstance";

export const doctorApi = {
    getDoctorTop: () =>
        axiosInstance.get("/doctor/top"),
};
