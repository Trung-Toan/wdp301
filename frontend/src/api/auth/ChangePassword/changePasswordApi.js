import { axiosInstance } from "../../axiosInstance";

export const changePasswordApi = {
    changePassword: (data) => axiosInstance.put("/auth/change-password", data),
};
