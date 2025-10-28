const assistantService = require("../../service/assistant/assistant.service");
const formatDataUtils = require("../../utils/formatData");
const resUtils = require("../../utils/responseUtils");
const appointmentService = require("../../service/appointment/appointment.service");
const slotService = require("../../service/slot/slot.service");
const dateUtils = require("../../utils/date.utils");
const medical_recordService = require("../../service/medical_record/medicalRecord.service");
const moment = require("moment-timezone");
const MedicalRecord = require("../../model/patient/MedicalRecord");

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
  const { appointmentId } = req.params;
  const { status } = req.query;
  try {
    const app = await appointmentService.getAppointmentByIdDefault(appointmentId);
    if (!app) return resUtils.notFoundResponse(res, "Không tìm thấy lịch khám để phê duyệt");
    if (app.status !== "SCHEDULED") return resUtils.badRequestResponse(res, "Bạn chỉ được xác nhận với trạng thái là chờ duyệt");
    if (!status || (status !== "APPROVE" && status !== "CANCELLED"))
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
    const { date = new Date(), status = "" } = req.query;
    const assistant = await assistantService.getAssistantByAccountId(req.user.sub);
    const doctor_id = assistant.doctor_id;
    const slot = await slotService.getAllListSlotsByDoctorId(doctor_id, date, status);
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
    let { fee_amount, start_time, end_time, max_patients = 10, note = "", clinic_id } = req.body;

    // Convert string -> Date
    // Convert giờ client (VN) sang UTC để lưu đúng trong DB
    start_time = moment.tz(start_time, "Asia/Ho_Chi_Minh").utc().toDate();
    end_time = moment.tz(end_time, "Asia/Ho_Chi_Minh").utc().toDate();

    if (!start_time || !end_time || isNaN(start_time) || isNaN(end_time))
      return resUtils.badRequestResponse(res, "Sai định dạng ngày giờ");

    if ((start_time.getHours() * 60 + start_time.getMinutes()) >= (end_time.getHours() * 60 + end_time.getMinutes()))
      return resUtils.badRequestResponse(res, "Giờ bắt đầu phải bé hơn giờ kết thúc");

    if (!max_patients || max_patients < 1)
      return resUtils.badRequestResponse(res, "Số lượng người khám trong một slot phải lớn hơn 1");

    if (!fee_amount || fee_amount < 0)
      return resUtils.badRequestResponse(res, "Giá không được để trống và phải lớn hơn 0");

    const newSlotData = {
      doctor_id: assistant.doctor_id,
      status: "AVAILABLE",
      fee_amount,
      start_time,
      end_time,
      max_patients,
      note,
      clinic_id,
      created_by: assistant._id
    };

    const slot = await slotService.createSlot(newSlotData);
    return resUtils.createdResponse(res, slot, "Thêm slot mới thành công");
  } catch (error) {
    console.log("Lỗi tạo slot cho doctor: ", error);
    return resUtils.serverErrorResponse(res, error, "Lỗi không thể tạo slot");
  }
};

// PUT /slots/:slotId/doctor
exports.updateAppointmentSlot = async (req, res) => {
  const { slotId } = req.params;
  try {
    const findSlot = await slotService.getSlotById(slotId);
    if (!findSlot) return resUtils.badRequestResponse(res, "Không tìm thấy slot để update");

    let { fee_amount, start_time, end_time, max_patients = 10, note = "" } = req.body;
    // Convert string -> Date
    start_time = moment.tz(start_time, "Asia/Ho_Chi_Minh").utc().toDate();
    end_time = moment.tz(end_time, "Asia/Ho_Chi_Minh").utc().toDate();

    if (!(start_time || end_time))
      return resUtils.badRequestResponse(res, "Giờ bắt đầu và giờ kết thúc không được để trống");
    if ((start_time.getHours() * 60 + start_time.getMinutes()) >= (end_time.getHours() * 60 + end_time.getMinutes()))
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
// GET GET /created/medical-records?page=&limit=&slot&date=&status=
exports.viewListMedicalRecords = async (req, res) => {
  const assistance = await assistantService.getAssistantByAccountId(req.user.sub);
  if (!assistance) return resUtils.notFoundResponse(res, "Không tìm thấy tài khoản trợ lý");
  let { date = new Date() } = req.body;

  let {
    page = 1,
    limit = 10,
    slot = await slotService.slotAvaiable(assistance.doctor_id, dateUtils.changeToDateWithNowHouse(date)),
    status = ""
  } = req.body;

  try {
    const { data, pagination } = await assistantService.getMedicalRecordOfAssistant(assistance._id, page, limit, slot, status);
    return resUtils.paginatedResponse(res, data, pagination, "Lấy danh sách hồ sơ bệnh án thành công")
  } catch (error) {
    console.log(`Error at view list medical record: `, error);
    return resUtils.serverErrorResponse(res, error, "Lỗi không thể lấy giữ liệu hồ sơ bệnh án");
  }

};

// GET /medical-records/:recordId
exports.viewMedicalRecordDetail = async (req, res) => {
  res.json({ message: `View medical record detail with ID ${req.params.recordId}` });
};

/**
 * Kiểm tra các trường bắt buộc trong từng Medicine
 * @param {ObjectArray} medicines 
 * @returns error if not valid
 */
const validMedicines = (medicines) => {
  for (let i = 0; i < medicines.length; i++) {
    const med = medicines[i];
    if (!med.name) {
      return resUtils.badRequestResponse(res, `Tên thuốc (name) tại vị trí ${i + 1} là bắt buộc.`);
    }
    if (!med.dosage) {
      return resUtils.badRequestResponse(res, `Liều dùng (dosage) cho thuốc ${med.name} là bắt buộc.`);
    }
    if (!med.frequency) {
      return resUtils.badRequestResponse(res, `Tần xuất (frequency) cho thuốc ${med.name} là bắt buộc.`);
    }

    if (!med.duration) {
      return resUtils.badRequestResponse(res, `Thời gian dùng (duration) cho thuốc ${med.name} là bắt buộc.`);
    }
  }
}

// PUT /medical-records/:recordId
exports.updateMedicalRecord = async (req, res) => {
  const { recordId } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(recordId)) {
    return resUtils.badRequestResponse(res, "ID hồ sơ bệnh án không hợp lệ.");
  }

  if (updateData.prescription && updateData.prescription.medicines) {
    if (!Array.isArray(updateData.prescription.medicines)) {
      return resUtils.badRequestResponse(res, "Trường medicines trong đơn thuốc phải là một mảng.");
    }
    // Kiểm tra các trường bắt buộc trong từng Medicine
    validMedicines(updateData.prescription.medicines);
  }

  if (Object.keys(updateData).length === 0) {
    return resUtils.badRequestResponse(res, "Không có dữ liệu hợp lệ để cập nhật.");
  }

  try {
    // 3. Gọi service 1 lần duy nhất
    const updated = await medical_recordService.updateMedicalRecord(recordId, updateData);

    // 4. Kiểm tra kết quả
    // Nếu 'updated' là null, có nghĩa là không tìm thấy HOẶC đã bị VERIFIED
    if (!updated) {
      return resUtils.notFoundResponse(res, "Không tìm thấy hồ sơ bệnh án hoặc hồ sơ đã được duyệt (không thể cập nhật).");
    }

    return resUtils.updatedResponse(res, updated, "Cập nhật hồ sơ bệnh án thành công");

  } catch (error) {
    console.log(`Lỗi tại updateMedicalRecord với id ${recordId} bởi: `, error);

    // Xử lý lỗi Mongoose validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return resUtils.badRequestResponse(res, `Lỗi dữ liệu: ${messages.join(', ')}`);
    }

    return resUtils.serverErrorResponse(res, error, "Lỗi hệ thống không thể cập nhật hồ sơ bệnh án");
  }
};

// POST /medical-records/appointment/:appointmentId
exports.createMedicalRecord = async (req, res) => {
  try {
    const assistance = await assistantService.getAssistantByAccountId(req.user.sub);
    if (!assistance) {
      return resUtils.notFoundResponse(res, "Không tìm thấy tài khoản trợ lý");
    }
    const created_by = assistance._id;

    const { appointmentId } = req.params;
    const {
      diagnosis, symptoms, notes, attachments,
      prescription,
      doctor_id, patient_id, status
    } = req.body;
    if (!diagnosis || !doctor_id || !patient_id || !prescription) {
      return resUtils.badRequestResponse(res, "Thiếu thông tin bắt buộc: diagnosis, doctor_id, patient_id, hoặc prescription.");
    }
    if (!mongoose.Types.ObjectId.isValid(appointmentId) ||
      !mongoose.Types.ObjectId.isValid(doctor_id) ||
      !mongoose.Types.ObjectId.isValid(patient_id)) {
      return resUtils.badRequestResponse(res, "ID lịch hẹn, bác sĩ hoặc bệnh nhân không hợp lệ.");
    }
    if (typeof prescription !== 'object' || prescription === null) {
      return resUtils.badRequestResponse(res, "Thông tin đơn thuốc (prescription) không hợp lệ.");
    }
    const medicines = Array.isArray(prescription.medicines) ? prescription.medicines : [];
    validMedicines(medicines);
    const medical_record_data = {
      diagnosis,
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      notes: notes || "",
      attachments: Array.isArray(attachments) ? attachments : [],

      prescription: {
        ...prescription,
        medicines: medicines, // Đã kiểm tra và là array
      },
      status: status || "PRIVATE",
      doctor_id,
      patient_id,
      appointment_id: appointmentId,
      created_by: created_by,
    };

    const added = await medical_recordService.createMedicalRecord(appointmentId, medical_record_data);

    return resUtils.successResponse(res, { medicalRecord: added }, "Tạo hồ sơ bệnh án thành công.");
  } catch (error) {
    console.error("Lỗi tại tạo hồ sơ bệnh án:", error.message || error);

    if (error.message.includes("Lịch hẹn không tồn tại")) {
      return resUtils.notFoundResponse(res, error.message);
    }
    if (error.message.includes("không được phép") || error.message.includes("không diễn ra hôm nay") || error.message.includes("không khớp")) {
      return resUtils.forbiddenResponse(res, error.message);
    }
    if (error.message.includes("đã có hồ sơ bệnh án") || error.message.includes("Lỗi dữ liệu")) {
      return resUtils.badRequestResponse(res, error.message);
    }

    return resUtils.serverErrorResponse(res, error, "Lỗi hệ thống không thể tạo hồ sơ bệnh án.");
  }
};
/* ========================= PROFILE ========================= */
// GET /profile
exports.viewProfile = async (req, res) => {
  res.json({ message: "View profile" });
};
