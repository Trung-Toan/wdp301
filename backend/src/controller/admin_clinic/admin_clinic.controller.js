const {
  createDoctor,
  getClinicByAdmin: getClinicByAdminSvc,
  getDoctorsByAdminClinic,
  createAssistant,
  getAssistantsByClinic,
  deleteAssistant: deleteAssistantSvc,
  getPendingDoctorLicenses,
  updateLicenseStatus: updateLicenseStatusSvc,
} = require("../../service/admin_clinic/adminClinic.service");

// Tạo tài khoản bác sĩ và liên kết với clinic của admin clinic hiện tại
exports.createAccountDoctor = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;

    const clinicResult = await getClinicByAdminSvc(accountId);
    if (!clinicResult.ok) return res.status(400).json(clinicResult);

    const clinic = clinicResult.data;

    // Chuẩn hoá specialty_id về mảng string unique + sạch (khớp model Doctor)
    const rawSpec = Array.isArray(req.body?.specialty_id) ? req.body.specialty_id : [];
    const specialty_id = [...new Set(rawSpec.map(String))].filter(Boolean);

    const payload = { ...req.body, clinic_id: clinic._id, specialty_id };

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

// Lấy danh sách trợ lý theo clinic mà admin_clinic đang quản lý
exports.getAssistants = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;

    const clinicResult = await getClinicByAdminSvc(accountId);
    if (!clinicResult.ok) return res.status(400).json(clinicResult);

    const clinic = clinicResult.data;

    const result = await getAssistantsByClinic(clinic._id);
    return res.status(result.ok ? 200 : 400).json(result);
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
