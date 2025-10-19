import { axiosInstance } from "../../axiosInstance";

export const logoutApi = {
    logout: () => axiosInstance.post("/auth/logout"),
};
