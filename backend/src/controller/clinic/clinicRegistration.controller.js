const clinicRegistrationService = require("../../service/clinic/clinicRegistration.service");
const { successResponse, errorResponse } = require("../../utils/responseUtils");

// Tạo yêu cầu đăng ký phòng khám
exports.createRegistrationRequest = async (req, res) => {
    try {
        const { clinic_info } = req.body;
        const admin_clinic_id = req.user.admin_clinic_id; // Từ middleware auth

        if (!clinic_info) {
            return errorResponse(res, "Thiếu thông tin phòng khám", 400);
        }

        const request = await clinicRegistrationService.createRegistrationRequest({
            admin_clinic_id,
            clinic_info,
        });

        return successResponse(res, request, "Tạo yêu cầu đăng ký thành công");
    } catch (error) {
        return errorResponse(res, error.message, 400);
    }
};

// Lấy danh sách chuyên khoa
exports.getSpecialties = async (req, res) => {
    try {
        const specialties = await clinicRegistrationService.getSpecialties();
        return successResponse(res, specialties, "Lấy danh sách chuyên khoa thành công");
    } catch (error) {
        return errorResponse(res, error.message, 400);
    }
};
