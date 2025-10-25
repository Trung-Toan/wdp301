const assistantService = require("../../service/assistant/assistant.service");
const formatDataUtils = require("../../utils/formatData");
const patientService = require("../../service/patient/patient.service");
const resUtils = require("../../utils/responseUtils");
const appointmentService = require("../../service/appointment/appointment.service");
const medicalRecordService = require("../../service/medical_record/medicalRecord.service");
const slotService = require("../../service/slot/slot.service");
const Slot = require("../../model/appointment/Slot");
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
    const { patientId } = req.params;
    const { appointment } = await appointmentService.getAppointmentById(req, patientId);

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
    const assistant = await assistantService.getAssistantByAccountId(req.user.sub);
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
    const { appointmentId } = req.params;
    const { appointment } = await appointmentService.getAppointmentById(req, appointmentId);
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

// PUT /verify/appointments/:appointmentId?status=
exports.verifyAppointment = async (req, res) => {
  const {appointmentId} = req.params;
  const {status} = req.query;
  const statusEnum = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];
  try {
    const app = await appointmentService.getAppointmentByIdDefault(appointmentId);
    if (!app) return resUtils.notFoundResponse(res, "Không tìm thấy lịch khám để phê duyệt");
    if (app.status !== "SCHEDULED") return resUtils.badRequestResponse(res, "Bạn chỉ được xác nhận với trạng thái là chờ duyệt");
    if (!status || status !== "COMPLETED" || status !== "CANCELLED") 
      return resUtils.badRequestResponse(res, "Trạng thái không phù hợp");
    app.status = status;
    const appUpdated = await appointmentService.updateAppointment(app._id, app);
    if (!appUpdated) return resUtils.badRequestResponse(res, "Cập nhật thất bại.");
    return resUtils.successResponse(res, appUpdated, "Update thành công.");
  } catch (error) {
    console.log(`Lỗi verify lịch khám tại id ${appointmentId}: `, error);
    return resUtils.serverErrorResponse(res, "Lỗi hệ thống không thể xác nhận lịch khám.")
  }
};

/* ========================= Slot ========================= */

// GET /slots/doctor
exports.viewAppointmentSlot = async (req, res) => {
  try {
    const assistant = await assistantService.getAssistantByAccountId(req.user.sub);
    const doctor_id = assistant.doctor_id;
    const slot = await slotService.getAllListSlotsByDoctorId(doctor_id);
    return resUtils.successResponse(
      res,
      slot,
      "Lấy danh sách slot thành công"
    );
  } catch (err) {
    console.log("error at view list slot: ", err);
    return resUtils.serverErrorResponse(res, err, `Lấy danh sách slot không thành công`);
  }
};

// GET /slots/:slotId/doctor
exports.viewSlotById = async (req, res) => {
  const { slotId } = req.params;
  try {
    const slot = await slotService.getSlotById(slotId);
    return resUtils.successResponse(
      res,
      slot,
      `Lấy slot bởi id ${slotId} thành công`
    );
  } catch (err) {
    console.log(`Lấy slot bởi id ${slotId} lỗi: `, err);
    return resUtils.serverErrorResponse(res, err, `Lấy danh sách chi tiết không thành công`);
  }
};

// POST /slots/doctor
exports.createAppointmentSlot = async (req, res) => {
  try {
    const assistant = await assistantService.getAssistantByAccountId(req.user.sub);
    const {doctor_id = assistant.doctor_id, status = "AVAILABLE", fee_amount, start_time, end_time, max_patients = 10, note = "", clinic_id} = req.body;
    if (!(start_time || end_time)) 
      return resUtils.badRequestResponse(res, "Giờ bắt đầu và giờ kết thúc không được để trống");
    if ((start_time.getUTCHours() * 60 + start_time.getUTCMinutes()) >= (end_time.getUTCHours() * 60 + end_time.getUTCMinutes())) 
      return resUtils.badRequestResponse(res, "Giờ bắt đầu phải bé hơn giờ kết thúc");
    if (!max_patients || max_patients < 1) 
      return resUtils.badRequestResponse(res, "Số lượng người khám trong một slot phải lớn hơn 1");
    if (!fee_amount || fee_amount < 0) 
      return resUtils.badRequestResponse(res, "Giá không được để trống và phải lớn hơn 0");
    const newSlot = new Slot(doctor_id, status, fee_amount, start_time, end_time, max_patients, note, clinic_id);
    const slot = await slotService.createSlot(newSlot);
    return resUtils.createdResponse(res, slot, "Thêm slot mới thành công")
  } catch (error) {
    console.log("Lỗi tạo slot cho doctor: ", error);
    return resUtils.serverErrorResponse(res, error, "Lỗi không thể tạo slot")
  }
};

// PUT PUT /slots/:slotId/doctor
exports.updateAppointmentSlot = async (req, res) => {
  const {slotId} = req.params;
  try {
    const findSlot = await slotService.getSlotById(slotId);
    if (!findSlot) 
      return resUtils.badRequestResponse(res, "Không tìm thấy slot để update");
    const {fee_amount, start_time, end_time, max_patients = 10, note = ""} = req.body;
    if (!(start_time || end_time)) 
      return resUtils.badRequestResponse(res, "Giờ bắt đầu và giờ kết thúc không được để trống");
    if ((start_time.getUTCHours() * 60 + start_time.getUTCMinutes()) >= (end_time.getUTCHours() * 60 + end_time.getUTCMinutes())) 
      return resUtils.badRequestResponse(res, "Giờ bắt đầu phải bé hơn giờ kết thúc");
    if (!max_patients || max_patients < 1) 
      return resUtils.badRequestResponse(res, "Số lượng người khám trong một slot phải lớn hơn 0");
    if (!fee_amount || fee_amount < 0) 
      return resUtils.badRequestResponse(res, "Giá không được để trống và phải lớn hơn hoặc bằng 0");
    findSlot.fee_amount = fee_amount;
    findSlot.start_time = start_time;
    findSlot.end_time = end_time;
    findSlot.max_patients = max_patients;
    findSlot.note = note;
    const slotUpdate = await slotService.updateSlotById(findSlot._id, findSlot);
    return resUtils.updatedResponse(res, slotUpdate, "Cập nhật slot thành công");
  } catch (error) {
    console.log(`Lỗi tại slot ${slotId} bởi: ` + error);
    return resUtils.serverErrorResponse(res, error, "Lỗi không thể update slot");
  }
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
