import { axiosInstance } from "../axiosInstance";

export const adminclinicAPI = {
    //lấy danh sách chuyên khoa
    getAllSpecialties: () => {
        return axiosInstance.get("/clinic-registration/specialties");
    },

    //gửi yêu cầu đăng ký phòng khám
    createRegistrationRequest: (data) => {
        return axiosInstance.post("/clinic-registration/create", data);
    },
};