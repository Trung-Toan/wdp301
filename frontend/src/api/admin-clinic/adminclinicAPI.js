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

  //lấy danh sách chuyên khoa
  getSpecialties: () => {
    return axiosInstance.get("/clinic-registration/specialties");
  },

  //lấy clinic mà admin clinic hiện tại quản lý
  getClinicByAdmin: () => {
    return axiosInstance.get("/admin_clinic/get_clinic");
  },

  //lấy chi tiết bác sĩ theo id
  getDoctorById: (doctorId) => {
    return axiosInstance.get(`/doctor/${doctorId}`);
  },

  //tạo tài khoản trợ lý cho bác sĩ
  createAccountAssistant: (data) => {
    return axiosInstance.post("/admin_clinic/create_assistant", data);
  },

  //lấy danh sách trợ lý của clinic mà admin clinic hiện tại quản lý
  getAssistantsOfAdminClinic: () => {
    return axiosInstance.get("/admin_clinic/get_assistants");
  },

  //xoá trợ lý theo id
  deleteAssistant: (assistantId) => {
    return axiosInstance.delete(
      `/admin_clinic/delete_assistant/${assistantId}`
    );
  },

  //lấy danh sách giấy phép bác sĩ đang chờ duyệt
  getPendingLicenses: () => {
    return axiosInstance.get("/admin_clinic/pending_licenses");
  },

  //cập nhật trạng thái giấy phép bác sĩ
  updateLicenseStatus: (licenseId, data) => {
    return axiosInstance.put(
      `/admin_clinic/update_license_status/${licenseId}`,
      data
    );
  },
};
