const doctorService = require("../../service/doctor/doctor.service");
const resUtils = require("../../utils/responseUtils");
const patientService = require("../../service/patient/patient.service");
const appointmentService = require("../../service/appointment/appointment.service");
const formatDataUtils = require("../../utils/formatData");
const medicalRecordService = require("../../service/medical_record/medicalRecord.service");

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
    const { patient } = await patientService.getPatientById(req);

    return resUtils.successResponse(
      res,
      formatDataUtils.formatData(patient) || null,
      "Lấy thông tin bệnh nhân thành công."
    );
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error in viewListPatients:", error);
    return resUtils.errorResponse(res, error.message || "Có lỗi xảy ra", 500);
  }
};

// GET /patients/code/:patientCode
exports.viewPatientByCode = async (req, res) => {
  try {
    const { patient } = await patientService.getPatientByCode(req);

    return resUtils.successResponse(
      res,
      {
        patient: formatDataUtils.formatData(patient) || null,
      },
      "Lấy thông tin bệnh nhân thành công."
    );
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error in viewListPatients:", error);
    return resUtils.errorResponse(res, error.message || "Có lỗi xảy ra", 500);
  }
};

/* ========================= APPOINTMENTS ========================= */
// GET /appointments?page=1&limit=10&status=""&slot=""&date=""
exports.viewAppointments = async (req, res) => {
  const { appointments, pagination } = await appointmentService.getListAppointments(req);

  return resUtils.paginatedResponse(
    res,
    appointments,
    pagination,
    "Lấy danh sách cuộc hẹn thành công."
  );
};

// GET /appointments/:appointmentId
exports.viewAppointmentDetail = async (req, res) => {
  const { appointment } = await appointmentService.getAppointmentById(req);
  return resUtils.successResponse(
    res,
    appointment,
    "Lấy thông tin cuộc hẹn thành công."
  );
};

/* ========================= MEDICAL RECORD REQUESTS ========================= */
// POST /doctor/patients/:patientId/medical-records/request
exports.requestViewMedicalRecord = async (req, res) => {
  try {
    const requests = await medicalRecordService.requestViewMedicalRecord(req);

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
// GET /doctor/patients/:patientId/medical-records
exports.viewListMedicalRecords = async (req, res) => {
  try {
    const { records, pagination } = await medicalRecordService.getListMedicalRecords(req);
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
  res.json({
    message: `View medical record detail with ID ${req.params.recordId}`,
  });
};

// PUT /doctor/medical-records/:recordId/verify
exports.verifyMedicalRecord = async (req, res) => {
  res.json({ message: `Verify medical record with ID ${req.params.recordId}` });
};

/* ========================= FEEDBACK ========================= */
// GET /doctor/feedback
exports.viewFeedbackList = async (req, res) => {
  res.json({ message: "View feedback list" });
};

/* ========================= ASSISTANTS ========================= */
// POST /doctor/assistants
exports.createAssistant = async (req, res) => {
  res.json({ message: "Create assistant account" });
};

// PUT /doctor/assistants/:assistantId/ban
exports.banOrUnbanAssistant = async (req, res) => {
  res.json({
    message: `Ban or Unban assistant with ID ${req.params.assistantId}`,
  });
};

// GET /doctor/assistants
exports.viewListAssistants = async (req, res) => {
  res.json({ message: "View list of assistants" });
};

/* ========================= PROFILE ========================= */
// GET /doctor/profile
exports.viewProfile = async (req, res) => {
  res.json({ message: "View doctor profile" });
};
