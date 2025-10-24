const assistantService = require("../../service/assistant/assistant.service");
const formatDataUtils = require("../../utils/formatData");
const patientService = require("../../service/patient/patient.service");
const resUtils = require("../../utils/responseUtils");
const appointmentService = require("../../service/appointment/appointment.service");
const medicalRecordService = require("../../service/medical_record/medicalRecord.service");
const slotService = require("../../service/slot/slot.service");
/* ========================= PATIENTS ========================= */
// GET /patients
exports.viewListPatients = async (req, res) => {
    try {
        const { patients, pagination } = await assistantService.getListPatients(req);

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
    const {patientId} = req.params;
    const {appointment} = await appointmentService.getAppointmentById(req, patientId);
    
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
        const assistant = await assistantService.getAssistantByAccountId (req.user.sub);
        const doctor_id = assistant.doctor_id;
        const { appointments, slot, pagination } = await appointmentService.getListAppointments(req, doctor_id);

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
    const {appointmentId} = req.params;
    const {appointment} = await appointmentService.getAppointmentById(req, appointmentId);
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

// PUT /appointments/:appointmentId/verify
exports.verifyAppointment = async (req, res) => {
    res.json({ message: `verify appointment ${req.params.appointmentId}` });
};

/* ========================= Slot ========================= */

// POST /appointments/:appointmentId/slots
exports.viewAppointmentSlot = async (req, res) => {
    try {
        const assistant = await assistantService.getAssistantByAccountId (req.user.sub);
        const doctor_id = assistant.doctor_id;
        const slot = await slotService.getAllListSlotsByDoctorId(doctor_id);

        return slot || [];
    } catch (err) {
        console.log ("error at view list slot: ", err);
        return [];
        
    }
};

// POST /appointments/:appointmentId/slots
exports.createAppointmentSlot = async (req, res) => {
    res.json({ message: `Create slot for appointment ID ${req.params.appointmentId}` });
};



// PUT /appointments/:appointmentId/slots
exports.updateAppointmentSlot = async (req, res) => {
    res.json({ message: `Update slot for appointment ID ${req.params.appointmentId}` });
};


/* ========================= MEDICAL RECORDS ========================= */
// GET /patients/:patientId/medical-records
exports.viewListMedicalRecords = async (req, res) => {
    res.json({ message: `View list medical records of patient ID ${req.params.patientId}` });
};

// GET /medical-records/:recordId
exports.viewMedicalRecordDetail = async (req, res) => {
    res.json({ message: `View medical record detail with ID ${req.params.recordId}` });
};

// PUT /medical-records/:recordId
exports.updateMedicalRecord = async (req, res) => {
    res.json({ message: `Update medical record with ID ${req.params.recordId}` });
};

//POST /medical-records/:recordId
exports.createMedicalRecord = async (req, res) => {
    res.json({ message: `Create medical record with ID ${req.params.recordId}` });
};

/* ========================= PROFILE ========================= */
// GET /profile
exports.viewProfile = async (req, res) => {
    res.json({ message: "View profile" });
};
