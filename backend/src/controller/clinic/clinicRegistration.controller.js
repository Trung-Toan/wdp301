const clinicRegistrationService = require("../../service/clinic/clinicRegistration.service");
const {
  successResponse,
  badRequestResponse,
} = require("../../utils/responseUtils");

// Tạo yêu cầu đăng ký phòng khám
exports.createRegistrationRequest = async (req, res) => {
  try {
    const { clinic_info } = req.body;
    const admin_clinic_id = req.user.admin_clinic_id; // Từ middleware auth

    if (!clinic_info) {
      return badRequestResponse(res, "Thiếu thông tin phòng khám", 400);
    }

    const request = await clinicRegistrationService.createRegistrationRequest({
      admin_clinic_id,
      clinic_info,
    });

    return successResponse(res, request, "Tạo yêu cầu đăng ký thành công");
  } catch (error) {
    return badRequestResponse(res, error.message, 400);
  }
};

// Lấy danh sách chuyên khoa
exports.getSpecialties = async (req, res) => {
  try {
    const specialties = await clinicRegistrationService.getSpecialties();
    return successResponse(
      res,
      specialties,
      "Lấy danh sách chuyên khoa thành công"
    );
  } catch (error) {
    return badRequestResponse(res, error.message, 400);
  }
};

// Lấy danh sách phòng khám chờ duyệt (Admin System)
exports.getPendingClinics = async (req, res) => {
  try {
    const clinics = await clinicRegistrationService.getPendingClinics();
    return successResponse(
      res,
      clinics,
      "Lấy danh sách phòng khám chờ duyệt thành công"
    );
  } catch (error) {
    return badRequestResponse(res, error.message, 400);
  }
};

// Lấy danh sách phòng khám đã được duyệt (Admin System)
exports.getApprovedClinics = async (req, res) => {
  try {
    const clinics = await clinicRegistrationService.getApprovedClinics();
    return successResponse(
      res,
      clinics,
      "Lấy danh sách phòng khám đã duyệt thành công"
    );
  } catch (error) {
    return badRequestResponse(res, error.message, 400);
  }
};

// Duyệt phòng khám (Admin System)
exports.approveClinic = async (req, res) => {
  try {
    const { clinic_id } = req.params;
    const { review_notes } = req.body;
    const admin_system_id = req.user.admin_system_id;

    if (!admin_system_id) {
      return badRequestResponse(res, "Không có quyền duyệt phòng khám", 403);
    }
    const clinic = await clinicRegistrationService.approveClinic({
      clinic_id,
      admin_system_id,
      review_notes,
    });

    return successResponse(res, clinic, "Duyệt phòng khám thành công");
  } catch (error) {
    return badRequestResponse(res, error.message, 400);
  }
};

// Từ chối phòng khám (Admin System)
exports.rejectClinic = async (req, res) => {
  try {
    const { clinic_id } = req.params;
    const { rejection_reason } = req.body;
    // admin_system_id có thể không có nếu AdminSystem record chưa được tạo trong DB
    // Sử dụng req.user.sub (Account ID) làm fallback nếu admin_system_id không có
    const admin_system_id = req.user.admin_system_id || req.user.sub;

    const clinic = await clinicRegistrationService.rejectClinic({
      clinic_id,
      admin_system_id,
      rejection_reason,
    });

    return successResponse(res, clinic, "Từ chối phòng khám thành công");
  } catch (error) {
    return badRequestResponse(res, error.message, 400);
  }
};
