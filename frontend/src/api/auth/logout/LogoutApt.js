import { axiosInstance } from "../../axiosInstance";

export const logoutApi = {
    logout: (refreshToken) => axiosInstance.post("/auth/logout", { refreshToken }),
};
