const assistantService = require("../../service/assistant/assistant.service");
const formatDataUtils = require("../../utils/formatData");
const resUtils = require("../../utils/responseUtils");
const appointmentService = require("../../service/appointment/appointment.service");
const slotService = require("../../service/slot/slot.service");
const dateUtils = require("../../utils/date.utils");
const medical_recordService = require("../../service/medical_record/medicalRecord.service");
const moment = require("moment-timezone");
const MedicalRecord = require("../../model/patient/MedicalRecord");
const notificationService = require("../../service/notification/notification.service");
const Appointment = require("../../model/appointment/Appointment");
const mongoose = require("mongoose"); // Thêm dòng này vì bạn dùng mongoose.Types.ObjectId.isValid trong updateAppointment

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
    // Lưu ý: Có vẻ bạn đang dùng patientId để lấy appointment, nên kiểm tra lại logic này.
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
  const { status } = req.query; // status là "APPROVE" hoặc "CANCELLED"
  try {
    const app = await appointmentService.getAppointmentByIdDefault(appointmentId);
    if (!app) return resUtils.notFoundResponse(res, "Không tìm thấy lịch khám để phê duyệt");
    if (app.status !== "SCHEDULED") return resUtils.badRequestResponse(res, "Bạn chỉ được xác nhận với trạng thái là chờ duyệt");
    if (!status || (status !== "APPROVE" && status !== "CANCELLED"))
      return resUtils.badRequestResponse(res, "Trạng thái không phù hợp");

    app.status = status;
    const appUpdated = await appointmentService.updateAppointment(app._id, app);
    if (!appUpdated) return resUtils.badRequestResponse(res, "Cập nhật thất bại.");

    // --- BẮT ĐẦU LOGIC GỬI THÔNG BÁO ---
    // (status là "APPROVE" hoặc "CANCELLED" đã được xác thực ở trên)
    try {
      // Service thông báo cần dữ liệu đã được populate (như tên bác sĩ, tên phòng khám)
      // `appUpdated` từ service trả về (do .lean()) có thể không chứa thông tin này.
      // Vì vậy, chúng ta fetch lại appointment với populate đầy đủ.
      const populatedApp = await Appointment.findById(appUpdated._id)
        .populate({
          path: "doctor_id",
          populate: { path: "user_id", select: "full_name" } // Lấy tên bác sĩ
        })
        .populate("clinic_id", "name") // Lấy tên phòng khám
        .populate("specialty_id", "name") // Lấy tên chuyên khoa
        .lean();

        console.log("BAT DAU TAO NOTIFY");
        

      if (populatedApp) {
        // Gọi service thông báo với dữ liệu đầy đủ và trạng thái mới
        await notificationService.createAppointmentStatusUpdateNotification(
          populatedApp,
          appUpdated.status // Gửi trạng thái đã được cập nhật ("APPROVE" hoặc "CANCELLED")
        );
      } else {
        console.error(`[Notify] Failed to fetch populated app ${appUpdated._id} for notification.`);
      }
    } catch (notifyError) {
      // Quan trọng: Ghi log lỗi gửi thông báo
      // nhưng KHÔNG trả về lỗi 500 cho client.
      // Việc xác nhận lịch khám thành công quan trọng hơn.
      console.error(`[Notify] Error sending status update notification for ${appUpdated._id}:`, notifyError);
    }
    // --- KẾT THÚC LOGIC GỬI THÔNG BÁO ---

    return resUtils.successResponse(res, appUpdated, "Update thành công.");
  } catch (error) {
    console.log(`Lỗi verify lịch khám tại id ${appointmentId}: `, error);
    return resUtils.serverErrorResponse(res, "Lỗi hệ thống không thể xác nhận lịch khám.")
  }
};

// PUT /update/appointments/:appointmentId
// Đã được refactor dựa trên updateMedicalRecord
exports.updateAppointment = async (req, res) => {
  console.log("CALL API");
  
  const { appointmentId } = req.params;
  const updateData = req.body;
  console.log("Received update data for appointment:", appointmentId);
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return resUtils.badRequestResponse(res, "ID lịch khám không hợp lệ.");
  }
  if (Object.keys(updateData).length === 0) {
    return resUtils.badRequestResponse(res, "Không có dữ liệu hợp lệ để cập nhật.");
  }
  try {
    const updatedAppointment = await appointmentService.updateAppointment(
      appointmentId,
      updateData
    );
    if (!updatedAppointment) {
      return resUtils.notFoundResponse(
        res,
        "Không tìm thấy lịch khám hoặc lịch khám không thể cập nhật."
      );
    }
    return resUtils.successResponse(
      res,
      updatedAppointment,
      "Cập nhật lịch khám thành công."
    );
  } catch (error) {
    console.log(`Lỗi update lịch khám tại id ${appointmentId}: `, error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return resUtils.badRequestResponse(
        res,
        `Lỗi dữ liệu: ${messages.join(", ")}`
      );
    }
    return resUtils.serverErrorResponse(
      res,
      error, // Truyền cả đối tượng lỗi để log nếu cần
      "Lỗi hệ thống không thể cập nhật lịch khám."
    );
  }
}; // <-- ĐÓNG NGOẶC CỦA exports.updateAppointment ĐÃ ĐƯỢC CHUYỂN LÊN ĐÂY

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
    let { fee_amount, start_time, end_time, max_patients = 10, note = "" } = req.body;

    // Convert string -> Date
    // Convert giờ client (VN) sang UTC để lưu đúng trong DB
    start_time = moment.tz(start_time, "Asia/Ho_Chi_Minh").utc().toDate();
    end_time = moment.tz(end_time, "Asia/Ho_Chi_Minh").utc().toDate();

    if (!start_time || !end_time || isNaN(start_time.getTime()) || isNaN(end_time.getTime())) // Sử dụng getTime() để kiểm tra Date object hợp lệ
      return resUtils.badRequestResponse(res, "Sai định dạng ngày giờ");

    // Lấy giờ và phút (local time) để so sánh
    const startMinutes = start_time.getHours() * 60 + start_time.getMinutes();
    const endMinutes = end_time.getHours() * 60 + end_time.getMinutes();

    if (startMinutes >= endMinutes)
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
      clinic_id: assistant.clinic_id,
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
  const assistant = await assistantService.getAssistantByAccountId(req.user.sub);
  const { slotId } = req.params;
  try {
    const findSlot = await slotService.getSlotById(slotId);
    if (!findSlot) return resUtils.badRequestResponse(res, "Không tìm thấy slot để update");

    let { fee_amount = 500000, start_time, end_time, max_patients = 10, note = "", status = "" } = req.body;
    console.log("Received update data:", req.body);

    // Convert string -> Date, kiểm tra sự tồn tại của start_time/end_time trước khi chuyển đổi
    let updated_start_time = findSlot.start_time;
    let updated_end_time = findSlot.end_time;

    if (start_time) {
      updated_start_time = moment.tz(start_time, "Asia/Ho_Chi_Minh").utc().toDate();
    }
    if (end_time) {
      updated_end_time = moment.tz(end_time, "Asia/Ho_Chi_Minh").utc().toDate();
    }

    // Kiểm tra tính hợp lệ của Date object sau khi chuyển đổi (nếu có)
    if ((start_time && isNaN(updated_start_time.getTime())) || (end_time && isNaN(updated_end_time.getTime()))) {
      return resUtils.badRequestResponse(res, "Sai định dạng ngày giờ");
    }

    // So sánh giờ và phút (local time)
    const startMinutes = updated_start_time.getHours() * 60 + updated_start_time.getMinutes();
    const endMinutes = updated_end_time.getHours() * 60 + updated_end_time.getMinutes();

    if (startMinutes >= endMinutes)
      return resUtils.badRequestResponse(res, "Giờ bắt đầu phải bé hơn giờ kết thúc");

    if (!max_patients || max_patients < 1)
      return resUtils.badRequestResponse(res, "Số lượng người khám trong một slot phải lớn hơn 0");
    if (fee_amount < 0)
      return resUtils.badRequestResponse(res, "Giá phải lớn hơn hoặc bằng 0");

    findSlot.fee_amount = fee_amount;
    findSlot.start_time = updated_start_time;
    findSlot.end_time = updated_end_time;
    findSlot.max_patients = max_patients;
    findSlot.note = note;
    findSlot.clinic_id = assistant.clinic_id;
    findSlot.doctor_id = assistant.doctor_id;
    if (status && (status === "AVAILABLE" || status === "UNAVAILABLE")) {
      findSlot.status = status;
    }
    const slotUpdate = await slotService.updateSlotById(findSlot._id, findSlot);
    return resUtils.updatedResponse(res, slotUpdate, "Cập nhật slot thành công");
  } catch (error) {
    console.log(`Lỗi tại slot ${slotId} bởi: ` + error);
    return resUtils.serverErrorResponse(res, error, "Lỗi không thể update slot");
  }
};


/* ========================= MEDICAL RECORDS ========================= */
// Hàm validMedicines phải được định nghĩa ở ngoài để các hàm khác có thể sử dụng
const validMedicines = (res, medicines) => {
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
  return null; // Trả về null nếu hợp lệ
}


// GET GET /created/medical-records?page=&limit=&slot&date=&status=
exports.viewListMedicalRecords = async (req, res) => {
  const assistance = await assistantService.getAssistantByAccountId(req.user.sub);
  if (!assistance) return resUtils.notFoundResponse(res, "Không tìm thấy tài khoản trợ lý");


  // Lấy giá trị từ query (GET), không phải body
  let { date } = req.query;
  // Dùng date hiện tại nếu không có
  if (!date) {
    date = new Date();
  }

  let {
    page = 1,
    limit = 10,
    slot, // Lấy slot từ query nếu có
    status = ""
  } = req.query;

  // Nếu không có slot trong query, tìm slot availble của bác sĩ
  if (!slot) {
    slot = await slotService.slotAvaiable(assistance.doctor_id, dateUtils.changeToDateWithNowHouse(date));
  }

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
  try {
    const { recordId } = req.params;
    const record = await medical_recordService.getMedicalRecordById(recordId);
    return resUtils.successResponse(res, record, "lấy giữ liệu hồ sơ bệnh án thành công");
  } catch (error) {
    console.log(`Lỗi lấy hồ sơ bệnh án bởi: `, error);
    return resUtils.serverErrorResponse(res, error, "Lỗi hệ thống không thể lấy giữ liệu");
  }
};


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
    const validationError = validMedicines(res, updateData.prescription.medicines);
    if (validationError) {
      return validationError;
    }
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
      prescription, patient_id, status
    } = req.body;
    if (!diagnosis || !patient_id || !prescription) {
      return resUtils.badRequestResponse(res, "Thiếu thông tin bắt buộc: diagnosis, patient_id, hoặc prescription.");
    }
    if (!mongoose.Types.ObjectId.isValid(appointmentId) ||
      !mongoose.Types.ObjectId.isValid(patient_id)) {
      return resUtils.badRequestResponse(res, "ID lịch hẹn, bác sĩ hoặc bệnh nhân không hợp lệ.");
    }
    if (typeof prescription !== 'object' || prescription === null) {
      return resUtils.badRequestResponse(res, "Thông tin đơn thuốc (prescription) không hợp lệ.");
    }
    const medicines = Array.isArray(prescription.medicines) ? prescription.medicines : [];
    const validationError = validMedicines(res, medicines);
    if (validationError) {
      return validationError;
    }

    console.log("assistance?.doctor_id: ", assistance?.doctor_id);


    const medical_record_data = {
      diagnosis,
      doctor_id: assistance?.doctor_id,
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      notes: notes || "",
      attachments: Array.isArray(attachments) ? attachments : [],

      prescription: {
        ...prescription,
        medicines: medicines, // Đã kiểm tra và là array
      },
      status: status || "PRIVATE",
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
  try {
    const assistance = await assistantService.getAssistantByAccountId(req.user.sub);
    const user = await assistantService.getUserByAccountId(req.user.sub);
    const account = await assistantService.getAccountById(req.user.sub);
    
    if (!assistance || !user || !account) return resUtils.notFoundResponse(res, "Không tìm thấy tài khoản trợ lý");

    const formattedAssistant = {
      account, information: user, assistant: assistance
    };
    
    return resUtils.successResponse(res, formattedAssistant, "Lấy thông tin profile trợ lý thành công");
  } catch (error) {
    console.log("Lỗi lấy profile trợ lý: ", error);
    return resUtils.serverErrorResponse(res, error, "Lỗi hệ thống không thể lấy thông tin profile trợ lý");
  }
};

// PUT /profile
exports.updateProfile = async (req, res) => {
  try {
    const assistance = await assistantService.getAssistantByAccountId(req.user.sub);
    if (!assistance) return resUtils.notFoundResponse(res, "Không tìm thấy tài khoản trợ lý");

    const user = await assistantService.getUserByAccountId(req.user.sub);
    if (!user) return resUtils.notFoundResponse(res, "Không tìm thấy thông tin người dùng");

    const updateData = req.body;
    const updatedUser = await assistantService.updateUserById(user._id, updateData);
    return resUtils.updatedResponse(res, updatedUser, "Cập nhật thông tin profile trợ lý thành công");
  } catch (error) {
    console.log("Lỗi cập nhật profile trợ lý: ", error);
    return resUtils.serverErrorResponse(res, error, "Lỗi hệ thống không thể cập nhật thông tin profile trợ lý");
  }
};

// POST /change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return resUtils.badRequestResponse(res, "Cần cung cấp mật khẩu hiện tại và mật khẩu mới.");
    }

    const assistance = await assistantService.getAssistantByAccountId(req.user.sub);
    if (!assistance) return resUtils.notFoundResponse(res, "Không tìm thấy tài khoản trợ lý");

    const user = await assistantService.getUserByAccountId(req.user.sub);
    if (!user) return resUtils.notFoundResponse(res, "Không tìm thấy thông tin người dùng");

    const result = await assistantService.changePassword(user.account_id, currentPassword, newPassword);
    if (!result.success) {
      return resUtils.badRequestResponse(res, result.message);
    }

    return resUtils.successResponse(res, result, "Đổi mật khẩu thành công");
  } catch (error) {
    console.log("Lỗi đổi mật khẩu trợ lý: ", error);
    return resUtils.serverErrorResponse(res, error, "Lỗi hệ thống không thể đổi mật khẩu trợ lý");
  }
};