import { axiosInstance } from "../axiosInstance";
import axios from "axios";
import { baseURL } from "../axiosInstance";

export const profilePatientApi = {

    getInformation: () =>
        axiosInstance.get("/user/me"),

    updateInformation: (data) =>
        axiosInstance.put("/user/me", data),

    updateSetting: (data) =>
        axiosInstance.put("/user/settings", data),

    // Upload file (avatar) - sử dụng axios thông thường vì cần multipart/form-data
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('myFile', file);

        // Lấy token để gửi kèm
        const token =
            sessionStorage.getItem("access_token") ||
            sessionStorage.getItem("token") ||
            sessionStorage.getItem("accessToken");
        
        const cleanToken = token ? token.replace(/^"|"$/g, "") : null;

        const response = await axios.post(`${baseURL}/file/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }),
            },
        });

        return response;
    },
};

