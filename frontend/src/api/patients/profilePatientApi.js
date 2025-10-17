import { axiosInstance } from "../axiosInstance";

export const profilePatientApi = {

    getInformation: () =>
        axiosInstance.get("/user/me"),

    updateInformation: (data) =>
        axiosInstance.put("/user/me", data),
};

