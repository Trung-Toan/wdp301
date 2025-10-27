import { axiosInstance } from "../axiosInstance";

export const adminclinicAPI = {
  //lấy danh sách chuyên khoa
    getAllSpecialties: () => {
        return axiosInstance.get("/clinic-registration/specialties");
    },

    
};