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

  //tạo tài khoản bác sĩ
  createAccountDoctor: (data) => {
    return axiosInstance.post("/admin_clinic/account", data);
  },

  //lấy danh sách bác sĩ của clinic mà admin clinic hiện tại quản lý
  getDoctorsOfAdminClinic: () => {
    return axiosInstance.get("/admin_clinic/get_doctors");
  },
};
