// services/assistantService.js
// Mock service cho Assistant

// === HELPER LẤY NGÀY LOCAL ===
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  // getMonth() (0-11), nên cần + 1
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  // getDate() (1-31)
  const day = today.getDate().toString().padStart(2, "0");

  // Giả sử ngày hôm nay là 27/10/2025 để khớp mock data
  // BỎ DÒNG NÀY ĐI KHI CHẠY THẬT
  return "2025-10-27";

  // DÙNG DÒNG NÀY KHI CHẠY THẬT
  // return `${year}-${month}-${day}`;
};
// =============================

// --- SHIFT MOCK DATA ---
let mockShifts = [
  {
    _id: "SHIFT001",
    doctor_id: "DOC001",
    date: "2025-10-27", // Ngày hôm nay
    start_time: "08:00",
    end_time: "12:00",
    maxPatients: 5,
    patients: [], // Khởi tạo rỗng, sẽ được cập nhật khi duyệt/hủy
    status: "active",
  },
  {
    _id: "SHIFT002",
    doctor_id: "DOC001",
    date: "2025-10-27", // Ngày hôm nay
    start_time: "13:00",
    end_time: "17:00",
    maxPatients: 3,
    patients: [], // Ca này không có bệnh nhân
    status: "active",
  },
];

// --- PATIENT MOCK DATA ---
let mockPatients = [
  { _id: "PAT001", name: "Nguyen Van A", age: 30, phone: "0901234567" },
  { _id: "PAT002", name: "Tran Thi B", age: 25, phone: "0912345678" },
  { _id: "PAT003", name: "Le Van C", age: 40, phone: "0923456789" },
];

// --- APPOINTMENT MOCK DATA ---
let mockAppointments = [
  {
    _id: "APT001",
    shiftId: "SHIFT001", // Gán vào ca 1
    patientId: "PAT001",
    status: "SCHEDULED", // <-- Chờ duyệt
    reason: "Khám tổng quát",
    createdAt: "2025-10-27T07:30:00Z",
  },
  {
    _id: "APT002",
    shiftId: "SHIFT001", // Gán vào ca 1
    patientId: "PAT002",
    status: "SCHEDULED", // <-- Chờ duyệt
    reason: "Khám bệnh theo lịch",
    createdAt: "2025-10-27T08:00:00Z",
  },
  {
    _id: "APT003",
    shiftId: "SHIFT002", // Gán vào ca 2
    patientId: "PAT003",
    status: "APPROVE", // <-- Đã duyệt
    reason: "Tái khám",
    createdAt: "2025-10-27T09:00:00Z",
  },
  {
    _id: "APT004",
    shiftId: "SHIFT001", // Gán vào ca 1
    patientId: "PAT003", // Bệnh nhân Le Van C
    status: "COMPLETED", // <-- ĐÃ KHÁM XONG
    reason: "Đã khám xong",
    createdAt: "2025-10-27T09:30:00Z",
  },
];

// === THÊM MẢNG MỚI ĐỂ LƯU BỆNH ÁN ===
let mockMedicalRecords = [];
// ===================================

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// --- SHIFT FUNCTIONS ---
export const getShifts = async (doctorId, date) => {
  await delay();
  const shifts = mockShifts
    .filter((s) => s.doctor_id === doctorId && s.date === date)
    .map((s) => ({ ...s, patientsCount: s.patients.length })); // Tính lại patientsCount
  return { success: true, data: shifts };
};

export const createShift = async (doctorId, shift) => {
  await delay();
  const newShift = {
    _id: "SHIFT" + Date.now(),
    doctor_id: doctorId,
    status: "active",
    patients: [],
    patientsCount: 0,
    ...shift,
  };
  mockShifts.push(newShift);
  return { success: true, data: newShift };
};

export const updateShift = async (shiftId, shift) => {
  await delay();
  const index = mockShifts.findIndex((s) => s._id === shiftId);
  if (index !== -1) {
    mockShifts[index] = { ...mockShifts[index], ...shift };
    mockShifts[index].patientsCount = mockShifts[index].patients.length; // Tính lại
    return { success: true, data: mockShifts[index] };
  }
  return { success: false, error: "Shift not found" };
};

export const deleteShift = async (shiftId) => {
  await delay();
  const index = mockShifts.findIndex((s) => s._id === shiftId);
  if (index !== -1) {
    const deleted = mockShifts.splice(index, 1);
    return { success: true, data: deleted[0] };
  }
  return { success: false, error: "Shift not found" };
};

// --- PATIENT FUNCTIONS ---
export const getPatients = async () => {
  await delay();
  return { success: true, data: mockPatients };
};

// --- APPOINTMENT FUNCTIONS ---
export const getAppointments = async ({ doctorId, date, shiftId } = {}) => {
  await delay();
  let list = mockAppointments;

  if (shiftId) {
    list = list.filter((apt) => apt.shiftId === shiftId);
  } else if (date) {
    // Lọc appointment dựa trên các ca của bác sĩ trong ngày đó
    const doctorShiftsToday = mockShifts.filter(
      (s) => s.doctor_id === doctorId && s.date === date
    );
    const shiftIds = doctorShiftsToday.map((s) => s._id);
    list = list.filter((apt) => shiftIds.includes(apt.shiftId));
  }

  // Gắn thông tin patient và shift vào appointment
  const data = list.map((apt) => {
    const patient = mockPatients.find((p) => p._id === apt.patientId);
    const shift = mockShifts.find((s) => s._id === apt.shiftId);
    return { ...apt, patient, shift };
  });

  return { success: true, data };
};

// === SỬA LẠI LOGIC HÀM NÀY ===
export const updateAppointmentStatus = async (appointmentId, newStatus) => {
  await delay();
  const index = mockAppointments.findIndex((a) => a._id === appointmentId);
  if (index === -1) {
    return { success: false, error: "Appointment not found" };
  }

  // 1. Cập nhật trạng thái lịch hẹn
  mockAppointments[index].status = newStatus;
  const appointment = mockAppointments[index];

  // 2. Tìm ca làm việc tương ứng
  const shift = mockShifts.find((s) => s._id === appointment.shiftId);
  if (!shift) {
    // Vẫn trả về success vì appointment đã được cập nhật
    console.warn("Shift not found for appointment:", appointmentId);
    return { success: true, data: appointment };
  }

  // 3. Cập nhật mảng `patients` trong `shift`
  const patientExistsInShift = shift.patients.includes(appointment.patientId);

  // Chỉ thêm khi được duyệt (APPROVE) hoặc hoàn thành (COMPLETED)
  if (["APPROVE", "COMPLETED"].includes(newStatus)) {
    if (!patientExistsInShift) {
      shift.patients.push(appointment.patientId);
    }
  }
  // Chỉ xóa khi bị hủy (CANCELLED) hoặc vắng mặt (NO_SHOW)
  else if (["CANCELLED", "NO_SHOW"].includes(newStatus)) {
    if (patientExistsInShift) {
      shift.patients = shift.patients.filter(
        (pId) => pId !== appointment.patientId
      );
    }
  }
  // Cập nhật lại số lượng bệnh nhân (không cần nữa vì getShifts sẽ tính)
  // shift.patientsCount = shift.patients.length;

  return { success: true, data: appointment };
};
// ===============================

// === HÀM MỚI CHO DASHBOARD ===
export const getDashboardStats = async (doctorId = "DOC001") => {
  await delay();
  const today = getLocalDate(); // Lấy ngày hôm nay

  // 1. Lấy ca và lịch hẹn hôm nay của bác sĩ
  const todayShifts = mockShifts.filter(
    (s) => s.doctor_id === doctorId && s.date === today
  );
  const todayShiftIds = todayShifts.map((s) => s._id);
  const todayAppointments = mockAppointments.filter((apt) =>
    todayShiftIds.includes(apt.shiftId)
  );

  // 2. Tính toán
  // Số bệnh nhân đã được duyệt (APPROVE) HOẶC đã khám xong (COMPLETED)
  const todayPatients = todayAppointments.filter((apt) =>
    ["APPROVE", "COMPLETED"].includes(apt.status)
  ).length;

  // Tổng số lịch hẹn (SCHEDULED, APPROVE, COMPLETED)
  const upcomingAppointments = todayAppointments.filter((apt) =>
    ["SCHEDULED", "APPROVE", "COMPLETED"].includes(apt.status)
  ).length;

  // Lấy số lịch hẹn "Chờ duyệt" (SCHEDULED)
  const pendingRequests = todayAppointments.filter(
    (apt) => apt.status === "SCHEDULED"
  ).length;

  const stats = {
    todayPatients: todayPatients,         // BN đã duyệt/khám xong
    upcomingAppointments: upcomingAppointments, // Tổng lịch hẹn sẽ diễn ra
    appointmentChange: 5,               // % thay đổi (mock)
    pendingPrescriptions: 0,            // (mock)
    pendingRequests: pendingRequests,   // Yêu cầu (chờ duyệt)
    totalPatients: mockPatients.length, // Tổng bệnh nhân (mock)
  };

  return { success: true, data: stats };
};
// ====================================

// === THÊM HÀM MỚI ĐỂ TẠO BỆNH ÁN ===
export const createMedicalRecord = async (recordData) => {
  await delay();
  try {
    // Validate required fields (theo schema)
    if (!recordData.doctor_id || !recordData.patient_id || !recordData.appointment_id) {
      throw new Error("Missing required IDs (doctor, patient, appointment).");
    }

    const newRecord = {
      _id: "REC" + Date.now(),
      diagnosis: recordData.diagnosis || "",
      symptoms: recordData.symptoms || [],
      notes: recordData.notes || "",
      attachments: [], // Mặc định rỗng
      access_requests: [], // Mặc định rỗng
      prescription: null, // Mặc định null
      status: recordData.status || "PRIVATE", // Mặc định PRIVATE
      doctor_id: recordData.doctor_id,
      patient_id: recordData.patient_id,
      appointment_id: recordData.appointment_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockMedicalRecords.push(newRecord);
    console.log("Mock Medical Records:", mockMedicalRecords); // Để debug

    return { success: true, data: newRecord };
  } catch (error) {
    console.error("Error creating medical record:", error);
    return { success: false, error: error.message };
  }
};
// ===================================