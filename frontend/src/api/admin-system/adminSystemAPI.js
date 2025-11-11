import { axiosInstance } from "../axiosInstance";

export const adminSystemAPI = {
  // ========== Clinic Management ==========
  // Lấy danh sách phòng khám chờ duyệt
  getPendingClinics: () => {
    return axiosInstance.get("/clinic-registration/pending");
  },

  // Lấy danh sách phòng khám đã được duyệt
  getApprovedClinics: () => {
    return axiosInstance.get("/clinic-registration/approved");
  },

  // Duyệt phòng khám
  approveClinic: (clinicId, data = {}) => {
    return axiosInstance.put(`/clinic-registration/approve/${clinicId}`, data);
  },

  // Từ chối phòng khám
  rejectClinic: (clinicId, data = {}) => {
    return axiosInstance.put(`/clinic-registration/reject/${clinicId}`, data);
  },

  // ========== Account Management (ADMIN_CLINIC) ==========
  // Lấy danh sách ADMIN_CLINIC với filter
  getAdminClinicAccounts: (params = {}) => {
    return axiosInstance.get("/admin-system/accounts", { params });
  },

  // Lấy danh sách ADMIN_CLINIC đang chờ phê duyệt
  getPendingAdminClinicAccounts: (params = {}) => {
    return axiosInstance.get("/admin-system/accounts/pending", { params });
  },

  // Phê duyệt ADMIN_CLINIC
  approveAdminClinic: (accountId) => {
    return axiosInstance.put(`/admin-system/accounts/${accountId}/approve`);
  },

  // Từ chối ADMIN_CLINIC
  rejectAdminClinic: (accountId, rejectionReason) => {
    return axiosInstance.put(`/admin-system/accounts/${accountId}/reject`, {
      rejectionReason,
    });
  },

  // Ban ADMIN_CLINIC
  banAdminClinic: (accountId) => {
    return axiosInstance.put(`/admin-system/accounts/${accountId}/ban`);
  },

  // Unban ADMIN_CLINIC
  unbanAdminClinic: (accountId) => {
    return axiosInstance.put(`/admin-system/accounts/${accountId}/unban`);
  },

  // Lấy chi tiết ADMIN_CLINIC
  getAdminClinicDetail: (accountId) => {
    return axiosInstance.get(`/admin-system/accounts/${accountId}`);
  },

  // ========== Complaint Management ==========
  // Lấy danh sách tất cả khiếu nại
  getAllComplaints: (params = {}) => {
    return axiosInstance.get("/admin-system/complaints", { params });
  },

  // Lấy chi tiết khiếu nại
  getComplaintById: (complaintId) => {
    return axiosInstance.get(`/admin-system/complaints/${complaintId}`);
  },

  // Cập nhật trạng thái khiếu nại
  updateComplaintStatus: (complaintId, data) => {
    return axiosInstance.put(`/admin-system/complaints/${complaintId}/status`, data);
  },

  // Lấy thống kê khiếu nại
  getComplaintStats: () => {
    return axiosInstance.get("/admin-system/complaints/stats");
  },

  // ========== Dashboard ==========
  // Lấy thống kê dashboard
  getDashboardStats: () => {
    return axiosInstance.get("/admin-system/dashboard/stats");
  },

  // ========== License Management ==========
  // Lấy danh sách chứng chỉ hành nghề
  getAllLicenses: (params = {}) => {
    return axiosInstance.get("/admin-system/licenses", { params });
  },

  // Lấy chi tiết chứng chỉ hành nghề
  getLicenseById: (licenseId) => {
    return axiosInstance.get(`/admin-system/licenses/${licenseId}`);
  },

  // Cập nhật trạng thái chứng chỉ (Approve/Reject)
  updateLicenseStatus: (licenseId, data) => {
    return axiosInstance.put(`/admin-system/licenses/${licenseId}/status`, data);
  },

  // ========== Blacklist Management ==========
  // Lấy danh sách blacklist
  getBlacklists: (params = {}) => {
    return axiosInstance.get("/admin-system/blacklists", { params });
  },

  // Thêm tài khoản vào blacklist
  addToBlacklist: (data) => {
    return axiosInstance.post("/admin-system/blacklists", data);
  },

  // Xóa tài khoản khỏi blacklist
  removeFromBlacklist: (blacklistId) => {
    return axiosInstance.delete(`/admin-system/blacklists/${blacklistId}`);
  },
};

