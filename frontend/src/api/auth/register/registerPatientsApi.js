import { axiosInstance } from "../../axiosInstance";

export const registerPatientsApi = {
    register: (data) => axiosInstance.post("/auth/register", data),
};

