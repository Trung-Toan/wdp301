const {
  createDoctor,
  getClinicByAdmin,
  getDoctorsByAdminClinic,
} = require("../../service/admin_clinic/adminClinic.service");

//Tạo tài khoản bác sĩ và liên kết với clinic của admin clinic hiện tại
exports.createAccountDoctor = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;

    const clinicResult = await getClinicByAdmin(accountId);
    if (!clinicResult.ok) return res.status(400).json(clinicResult);

    const clinic = clinicResult.data;

    const payload = { ...req.body, clinic_id: clinic._id };

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
