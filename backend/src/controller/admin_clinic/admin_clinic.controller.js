const adminClinicService = require("../../service/admin_clinic/adminClinic.service");
const {
  createDoctor,
  getClinicByAdmin,
  getAllClinicsByAdmin,
  getDoctorsByAdminClinic,
  createAssistant,
  getAssistantsByClinic,
  getAssistantsByAdminClinic,
  deleteAssistant,
  getPendingDoctorLicenses,
  updateLicenseStatus,
  updateClinicByAdmin,
} = adminClinicService;

//Tạo tài khoản bác sĩ và liên kết với clinic của admin clinic hiện tại
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
      const clinicResult = await getClinicByAdmin(accountId);
      if (!clinicResult.ok) return res.status(400).json(clinicResult);
      clinicId = clinicResult.data._id;
    }

    const payload = { ...req.body, clinic_id: clinicId };

    const result = await createDoctor(payload);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

//Lấy clinic mà admin clinic hiện tại quản lý
exports.getClinicByAdmin = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    const result = await getClinicByAdmin(accountId);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

//Lấy danh sách tất cả clinics mà admin clinic hiện tại quản lý
exports.getAllClinics = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    const result = await getAllClinicsByAdmin(accountId);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

//Lấy danh sách bác sĩ theo clinic mà admin_clinic đang quản lý
exports.getDoctorsOfAdminClinic = async (req, res, next) => {
  try {
    const adminAccountId = req.user?.sub || req.query.adminAccountId;
    if (!adminAccountId) {
      return res
        .status(400)
        .json({ message: "Thiếu adminAccountId hoặc token" });
    }

    const doctors = await getDoctorsByAdminClinic(adminAccountId);

    res.status(200).json({
      success: true,
      total: doctors.length,
      data: doctors,
    });
  } catch (err) {
    console.error("Lỗi trong controller getDoctorsOfAdminClinic:", err);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách bác sĩ",
      error: err.message,
    });
  }
};

//tạo tài khoản trợ lý cho bác sĩ
exports.createAccountAssistant = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;

    const clinicResult = await getClinicByAdmin(accountId);
    if (!clinicResult.ok) return res.status(400).json(clinicResult);

    const clinic = clinicResult.data;

    const payload = { ...req.body, clinic_id: clinic._id };

    const result = await createAssistant(payload);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

//lấy danh sách trợ lý từ tất cả các phòng khám mà admin_clinic đang quản lý
exports.getAssistants = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;

    const result = await getAssistantsByAdminClinic(accountId);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

//xoá trợ lý theo clinic mà admin_clinic đang quản lý
exports.deleteAssistant = async (req, res, next) => {
  try {
    await deleteAssistant(req.params.id);
    res.status(200).json({ ok: true, message: "Xoá trợ lý thành công." });
  } catch (err) {
    next(err);
  }
};

//xoá bác sĩ (bao gồm Doctor, User, Account)
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

    const result = await adminClinicService.deleteDoctor(doctorId, adminAccountId);
    
    if (result.ok) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    next(err);
  }
};

//lấy danh sách giấy phép bác sĩ đang chờ duyệt
exports.getPendingLicenses = async (req, res, next) => {
  try {
    const adminAccountId = req.user?.sub;

    const result = await getPendingDoctorLicenses(adminAccountId);

    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

//cập nhật trạng thái giấy phép bác sĩ
exports.updateLicenseStatus = async (req, res, next) => {
  try {
    const { id: licenseId } = req.params;
    const { status, rejected_reason } = req.body;
    const adminAccountId = req?.user?.sub;

    const result = await updateLicenseStatus(
      adminAccountId,
      licenseId,
      status,
      rejected_reason
    );
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};

//cập nhật thông tin phòng khám
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
