const doctorService = require("../../service/doctor/doctor.service");
const resUtils = require("../../utils/responseUtils");
const patientService = require("../../service/patient/patient.service");
const appointmentService = require("../../service/appointment/appointment.service");
const formatDataUtils = require("../../utils/formatData");
const medicalRecordService = require("../../service/medical_record/medicalRecord.service");

const assistantService = require("../../service/doctor/doctor.assistant.service");

/* ========================= PATIENTS ========================= */
// GET /patients
exports.viewListPatients = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ service, bao gồm cả 'patients' và 'pagination'
    // Truyền req.query vào để service có thể lấy page và limit (ví dụ: /patients?page=1&limit=10)

    const { patients, pagination } = await doctorService.getListPatients(req);

    // 2. Dùng .map() để tạo một mảng mới với định dạng mong muốn
    const formattedPatients =
      patients.map((patient) => formatDataUtils.formatData(patient)) || [];

    // 3. Trả về response thành công với dữ liệu đã được định dạng
    return resUtils.paginatedResponse(
      res,
      formattedPatients,
      pagination,
      "Lấy danh sách bệnh nhân thành công."
    );
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error in viewListPatients:", error);
    return resUtils.errorResponse(res, error.message || "Có lỗi xảy ra", 500);
  }
};

// GET /patients/:patientId
exports.viewPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { appointment } = await appointmentService.getAppointmentById(
      req,
      patientId
    );

    return resUtils.successResponse(
      res,
      {
        patient: appointment?.patient,
        medical_record: appointment?.medical_record,
      },
      "Lấy thông tin bệnh nhân thành công."
    );
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error in viewListPatients:", error);
    return resUtils.serverErrorResponse(
      res,
      error.message || "Có lỗi xảy ra",
      500
    );
  }
};

/* ========================= APPOINTMENTS ========================= */
// GET /appointments?page=1&limit=10&status=""&slot=""&date=""
exports.viewAppointments = async (req, res) => {
  try {
    const doctor = await doctorService.findDoctorByAccountId(req.user.sub);
    if (!doctor) {
      return resUtils.forbiddenResponse(
        "Truy cập bị từ chối: Không tìm thấy bác sĩ."
      );
    }
    const { appointments, slot, pagination } =
      await appointmentService.getListAppointments(req, doctor._id);

    return resUtils.paginatedResponse(
      res,
      { appointments, slot },
      pagination,
      "Lấy danh sách cuộc hẹn thành công."
    );
  } catch (error) {
    console.error("Error in viewAppointments:", error);
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi lấy danh sách cuộc hẹn."
    );
  }
};

// GET /appointments/:appointmentId
exports.viewAppointmentDetail = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { appointment } = await appointmentService.getAppointmentById(
      req,
      appointmentId
    );
    return resUtils.successResponse(
      res,
      appointment,
      "Lấy thông tin cuộc hẹn thành công."
    );
  } catch (error) {
    console.error("Error in viewAppointmentDetail:", error);
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi lấy thông tin cuộc hẹn."
    );
  }
};

/* ========================= MEDICAL RECORD REQUESTS ========================= */
// POST /doctor/patients/:patientId/medical-records/request
exports.requestViewMedicalRecord = async (req, res) => {
  try {
    const requests = await medicalRecordService.requestViewMedicalRecord(req);

    // Service trả về null → Không có hồ sơ nào
    if (!requests) {
      return resUtils.notFoundResponse(
        res,
        "Bệnh nhân này chưa có hồ sơ bệnh án."
      );
    }

    // Service lọc hết vì tất cả đều có yêu cầu PENDING/APPROVED
    // (Lúc này updatedRequests = [], service đã throw Error → nhảy vào catch)
    return resUtils.successResponse(
      res,
      { requests },
      "Yêu cầu xem hồ sơ bệnh án đã được gửi. Vui lòng chờ phê duyệt."
    );
  } catch (error) {
    console.error("Error in requestViewMedicalRecord:", error);

    // TH1: Lỗi do đã gửi yêu cầu rồi (service throw message cụ thể)
    if (
      error.message ===
      "Bạn đã gửi yêu cầu hoặc đã được cấp quyền truy cập hồ sơ của bệnh nhân này."
    ) {
      return resUtils.badRequestResponse(res, error.message);
    }

    // TH2: Các lỗi khác
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi gửi yêu cầu truy cập hồ sơ bệnh án."
    );
  }
};

// POST /doctor/patients/:patientId/medical-records/:medicalRecordsId/request
exports.requestViewMedicalRecordById = async (req, res) => {
  try {
    const requests = await medicalRecordService.requestViewMedicalRecordById(
      req
    );

    // Không có hồ sơ nào
    if (!requests) {
      return resUtils.notFoundResponse(
        res,
        "Bệnh nhân này chưa có hồ sơ bệnh án."
      );
    }

    // Nếu service ném lỗi (đã gửi hết hoặc lỗi nghiệp vụ)
    if (Array.isArray(requests) && requests.length === 0) {
      return resUtils.badRequestResponse(
        res,
        "Tất cả hồ sơ bệnh án của bệnh nhân này đã được gửi yêu cầu trước đó."
      );
    }

    // Thành công
    return resUtils.successResponse(
      res,
      { requests },
      "Yêu cầu xem hồ sơ bệnh án đã được gửi. Vui lòng chờ phê duyệt."
    );
  } catch (error) {
    console.error("Error in requestViewMedicalRecord:", error);
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi gửi yêu cầu truy cập hồ sơ bệnh án."
    );
  }
};

// GET /doctor/medical-records/requests/history
exports.viewHistoryMedicalRecordRequests = async (req, res) => {
  try {
    const { requests, pagination } =
      await medicalRecordService.getHistoryMedicalRecordRequests(req);
    return resUtils.paginatedResponse(
      res,
      { history_request: requests },
      pagination,
      "Lấy lịch sử yêu cầu xem hồ sơ bệnh án thành công."
    );
  } catch (error) {
    console.error("Error in viewHistoryMedicalRecordRequests:", error);
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi lấy lịch sử yêu cầu xem hồ sơ bệnh án."
    );
  }
};

/* ========================= MEDICAL RECORDS ========================= */
// GET /doctor/medical-records?page=1&limit=10&search=
exports.viewListMedicalRecords = async (req, res) => {
  try {
    const { records, pagination } =
      await medicalRecordService.getListMedicalRecords(req);
    return resUtils.paginatedResponse(
      res,
      records,
      pagination,
      "Lấy danh sách hồ sơ bệnh án thành công."
    );
  } catch (error) {
    console.error("Error in viewListMedicalRecords:", error);
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi lấy danh sách hồ sơ bệnh án."
    );
  }
};

// GET /doctor/verify/medical-records?page=1&limit=10&search=
exports.viewListMedicalRecordsVerify = async (req, res) => {
  try {
    const { records, pagination } =
      await medicalRecordService.getListMedicalRecordsVerify(req);
    return resUtils.paginatedResponse(
      res,
      records,
      pagination,
      "Lấy danh sách hồ sơ bệnh án thành công."
    );
  } catch (error) {
    console.error("Error in viewListMedicalRecords:", error);
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi lấy danh sách hồ sơ bệnh án."
    );
  }
};

// GET /doctor/patients/:patientId/medical-records
exports.viewListMedicalRecordsByPatient = async (req, res) => {
  try {
    const { records, pagination } =
      await medicalRecordService.getListMedicalRecords(req);
    return resUtils.paginatedResponse(
      res,
      { records: records.map((r) => formatDataUtils.formatData(r)) || [] },
      pagination,
      "Lấy danh sách hồ sơ bệnh án thành công."
    );
  } catch (error) {
    console.error("Error in viewListMedicalRecords:", error);
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi lấy danh sách hồ sơ bệnh án."
    );
  }
};

// GET /doctor/medical-records/:recordId
exports.viewMedicalRecordDetail = async (req, res) => {
  try {
    const medicalRecord = await medicalRecordService.getMedicalRecordById(req);
    return resUtils.successResponse(
      res,
      medicalRecord,
      "Lấy chi tiết hồ sơ bệnh án thành công."
    );
  } catch (error) {
    console.error("Error in viewMedicalRecordDetail:", error);

    // Nếu là lỗi không có quyền truy cập
    if (error.message === "Bạn không có quyền truy cập bệnh án này") {
      return resUtils.forbiddenResponse(
        res,
        "Bạn không có quyền truy cập bệnh án này."
      );
    }

    // Nếu bệnh án không tồn tại
    if (error.message === "Bệnh án không tồn tại") {
      return resUtils.notFoundResponse(res, error, "Bệnh án không tồn tại.");
    }

    // Các lỗi khác (lỗi server)
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi lấy chi tiết hồ sơ bệnh án."
    );
  }
};

// PUT /doctor/verify/medical-records/:recordId
exports.verifyMedicalRecord = async (req, res) => {
  try {
    const medicalRecord = await medicalRecordService.verifyMedicalRecord(req);
    return resUtils.successResponse(
      res,
      medicalRecord,
      "Xác nhận hồ sơ bệnh án thành công."
    );
  } catch (error) {
    console.error("Error in verifyMedicalRecord:", error);
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi xác nhận hồ sơ bệnh án."
    );
  }
};

/* ========================= FEEDBACK ========================= */
// GET /doctor/feedback
exports.viewFeedbackList = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error in viewFeedbackList:", error);
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi lấy danh sách phản hồi."
    );
  }
};

/* ========================= ASSISTANTS ========================= */
// POST /doctor/assistants
exports.createAssistant = async (req, res) => {
  try {
    const { assistant } = await assistantService.createAccountForAssistant(req);
    return resUtils.successResponse(
      res,
      assistant,
      "Tạo tài khoản trợ lý thành công."
    );
  } catch (error) {
    console.error("Error in createAssistant:", error);

    // ✅ Phân loại lỗi chi tiết hơn
    if (
      error.message.includes("Vui lòng cung cấp") ||
      error.message.includes("không hợp lệ") ||
      error.message.includes("đã tồn tại") ||
      error.message.includes("Truy cập bị từ chối")
    ) {
      return resUtils.badRequestResponse(res, error.message);
    }

    // ✅ Nếu là lỗi khác (DB, server, ...), trả về lỗi 500
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi tạo tài khoản trợ lý."
    );
  }
};

// PUT /doctor/assistants/:assistantId/ban
exports.banOrUnbanAssistant = async (req, res) => {
  try {
    const { message } = await assistantService.banAccountAssistant(req);
    return resUtils.successResponse(res, { message }, message);
  } catch (error) {
    console.error("Error in banOrUnbanAssistant:", error);

    // ✅ Phân biệt lỗi người dùng và lỗi hệ thống
    if (
      error.message.includes("Thiếu assistantId") ||
      error.message.includes("Trạng thái không hợp lệ") ||
      error.message.includes("Không tìm thấy") ||
      error.message.includes("Không thể cập nhật")
    ) {
      return resUtils.badRequestResponse(res, error.message);
    }

    // ✅ Nếu lỗi hệ thống, trả về 500
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi cập nhật trạng thái trợ lý."
    );
  }
};

// GET /doctor/assistants
exports.viewListAssistants = async (req, res) => {
  try {
    const { assistants, pagination } = await assistantService.getListAssistants(
      req
    );

    return resUtils.paginatedResponse(
      res,
      assistants,
      pagination,
      "Lấy danh sách trợ lý thành công."
    );
  } catch (error) {
    console.error("Error in viewListAssistants:", error);
    return resUtils.serverErrorResponse(
      res,
      error,
      "Có lỗi xảy ra khi lấy danh sách trợ lý."
    );
  }
};

/* ========================= PROFILE ========================= */
// GET /doctor/profile
exports.viewProfile = async (req, res, next) => {
  try {
    const data = await doctorService.getProfile(req.user.sub);
    console.log("User ID:", req.user.sub);
    resUtils.successResponse(res, data, "Lấy thống tin tài khoản");
  } catch (err) {
    next(err);
  }
};

// PUT /doctor/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const data = await doctorService.updateProfile(req.user.sub, req.body);
    resUtils.successResponse(res, data, "Cập nhật thống tin tài khoản");
  } catch (err) {
    next(err);
  }
};

// POST /doctor/upload-license
exports.uploadLicense = async (req, res, next) => {
  try {
    const data = await doctorService.uploadLicense(req.user.sub, req.file);
    resUtils.successResponse(
      res,
      data,
      "tải chứng chỉ nghề nghiệp, chờ phê duyệt"
    );
  } catch (err) {
    next(err);
  }
};

// GET /doctor/license
exports.getLicense = async (req, res, next) => {
  try {
    const data = await doctorService.getMyLicense(req.user.sub);
    resUtils.successResponse(res, data, "lấy chứng chỉ nghề nghiệp");
  } catch (err) {
    next(err);
  }
};
