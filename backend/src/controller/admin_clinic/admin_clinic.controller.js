const adminClinicService = require("../../service/admin_clinic/adminClinic.service");
const resUtils = require("../../utils/responseUtils");
const {
  createDoctor,
  getClinicByAdmin: getClinicByAdminSvc,
  getAllClinicsByAdmin,
  getDoctorsByAdminClinic,
  createAssistant,
  getAssistantsByClinic,
  getAssistantsByAdminClinic,
  deleteAssistant: deleteAssistantSvc,
  getPendingDoctorLicenses,
  updateLicenseStatus: updateLicenseStatusSvc,
  updateClinicByAdmin,
  deleteDoctor: deleteDoctorSvc,
} = adminClinicService;

exports.dashboard = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    const data = await adminClinicService.getDashboard(accountId);
    return resUtils.successResponse(res, data, "Lấy dữ liệu dashboard thành công");
  } catch (err) {
    return resUtils.serverErrorResponse(res, err.message || "Có lỗi xảy ra", 500);
  }
};

// Tạo tài khoản bác sĩ và liên kết với clinic của admin clinic hiện tại
exports.createAccountDoctor = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;

    // Nếu có clinic_id trong request body, kiểm tra xem phòng khám có thuộc về admin không
    // Nếu không, lấy phòng khám đầu tiên của admin
    let clinicId = req.body.clinic_id;
    
    if (clinicId) {
      // Validate: kiểm tra clinic_id có thuộc về admin này không
      const allClinicsResult = await getAllClinicsByAdmin(accountId);
      if (!allClinicsResult.ok) {
        return res.status(400).json({
          ok: false,
          message: "Không thể lấy danh sách phòng khám",
        });
      }
      const clinics = allClinicsResult.data || [];
      const clinicExists = clinics.some(
        (c) => c._id.toString() === clinicId.toString()
      );
      if (!clinicExists) {
        return res.status(403).json({
          ok: false,
          message: "Phòng khám không thuộc quyền quản lý của bạn",
        });
      }
    } else {
      // Fallback: lấy phòng khám đầu tiên nếu không có clinic_id
      const clinicResult = await getClinicByAdminSvc(accountId);
      if (!clinicResult.ok) return res.status(400).json(clinicResult);
      clinicId = clinicResult.data._id;
    }

    // Chuẩn hoá specialty_id về mảng string unique + sạch (khớp model Doctor)
    const rawSpec = Array.isArray(req.body?.specialty_id) ? req.body.specialty_id : [];
    const specialty_id = [...new Set(rawSpec.map(String))].filter(Boolean);

    const payload = { ...req.body, clinic_id: clinicId, specialty_id };

    const result = await createDoctor(payload);
    return res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

// Lấy clinic mà admin clinic hiện tại quản lý
exports.getClinicByAdmin = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    const result = await getClinicByAdminSvc(accountId);
    return res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách tất cả clinics mà admin clinic hiện tại quản lý
exports.getAllClinics = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    const result = await getAllClinicsByAdmin(accountId);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách bác sĩ theo clinic mà admin_clinic đang quản lý
exports.getDoctorsOfAdminClinic = async (req, res, next) => {
  try {
    const adminAccountId = req.user?.sub || req.query.adminAccountId;
    if (!adminAccountId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu adminAccountId hoặc token" });
    }

    const doctors = await getDoctorsByAdminClinic(adminAccountId);

    return res.status(200).json({
      success: true,
      total: doctors.length,
      data: doctors,
    });
  } catch (err) {
    console.error("Lỗi trong controller getDoctorsOfAdminClinic:", err);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách bác sĩ",
      error: err.message,
    });
  }
};

// Tạo tài khoản trợ lý cho bác sĩ
exports.createAccountAssistant = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;

    const clinicResult = await getClinicByAdminSvc(accountId);
    if (!clinicResult.ok) return res.status(400).json(clinicResult);

    const clinic = clinicResult.data;

    // FE có thể gửi roles[] hoặc type[] → gộp & chuẩn hoá sang type[] (unique + sạch)
    const rolesArr = Array.isArray(req.body?.roles) ? req.body.roles : [];
    const typeArr = Array.isArray(req.body?.type) ? req.body.type : [];
    const type = [...new Set([...rolesArr, ...typeArr].map(String))].filter(Boolean);

    const payload = { ...req.body, clinic_id: clinic._id, type };

    const result = await createAssistant(payload);
    return res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách trợ lý - hỗ trợ cả 2 cách: từ tất cả clinics hoặc từ clinic cụ thể
exports.getAssistants = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    
    // Nếu có query param clinic_id, lấy từ clinic cụ thể
    // Nếu không, lấy từ tất cả clinics của admin
    if (req.query.clinic_id) {
      const clinicResult = await getClinicByAdminSvc(accountId);
      if (!clinicResult.ok) return res.status(400).json(clinicResult);
      
      const clinic = clinicResult.data;
      // Validate clinic_id có thuộc về admin không
      const allClinicsResult = await getAllClinicsByAdmin(accountId);
      if (allClinicsResult.ok) {
        const clinics = allClinicsResult.data || [];
        const clinicExists = clinics.some(
          (c) => c._id.toString() === req.query.clinic_id.toString()
        );
        if (!clinicExists) {
          return res.status(403).json({
            ok: false,
            message: "Phòng khám không thuộc quyền quản lý của bạn",
          });
        }
      }
      
      const result = await getAssistantsByClinic(req.query.clinic_id);
      return res.status(result.ok ? 200 : 400).json(result);
    } else {
      // Lấy từ tất cả clinics
      const result = await getAssistantsByAdminClinic(accountId);
      res.status(result.ok ? 200 : 400).json(result);
    }
  } catch (err) {
    next(err);
  }
};

// Xoá trợ lý theo clinic mà admin_clinic đang quản lý
exports.deleteAssistant = async (req, res, next) => {
  try {
    await deleteAssistantSvc(req.params.id);
    return res
      .status(200)
      .json({ ok: true, message: "Xoá trợ lý thành công." });
  } catch (err) {
    next(err);
  }
};

// Xoá bác sĩ (bao gồm Doctor, User, Account)
exports.deleteDoctor = async (req, res, next) => {
  try {
    const adminAccountId = req.user?.sub;
    if (!adminAccountId) {
      return res.status(400).json({
        ok: false,
        message: "Thiếu thông tin admin account",
      });
    }

    const doctorId = req.params.id;
    if (!doctorId) {
      return res.status(400).json({
        ok: false,
        message: "Thiếu doctor ID",
      });
    }

    const result = await deleteDoctorSvc(doctorId, adminAccountId);
    
    if (result.ok) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách giấy phép bác sĩ đang chờ duyệt (PENDING)
exports.getPendingLicenses = async (req, res, next) => {
  try {
    const adminAccountId = req.user?.sub || req.query.adminAccountId;
    const result = await getPendingDoctorLicenses(adminAccountId);
    return res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

// Cập nhật trạng thái giấy phép bác sĩ (APPROVED / REJECTED)
exports.updateLicenseStatus = async (req, res, next) => {
  try {
    const adminAccountId = req?.user?.sub;
    const { id: licenseId } = req.params;
    const { status } = req.body;
    // chấp nhận cả rejectionReason & rejected_reason từ FE
    const rejectionReason =
      req.body?.rejectionReason ?? req.body?.rejected_reason ?? "";

    const result = await updateLicenseStatusSvc(
      adminAccountId,
      licenseId,
      status,
      rejectionReason
    );

    return res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

// Cập nhật thông tin phòng khám
exports.updateClinic = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    if (!accountId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const result = await updateClinicByAdmin(accountId, req.body);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};
