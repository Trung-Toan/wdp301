// services/assistantService.js
// Mock service cho Assistant

// === HELPER LẤY NGÀY LOCAL ===
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  // Hardcode for mock data consistency
  return "2025-10-27";
};
// =============================

// --- SHIFT MOCK DATA ---
let mockShifts = [
  {
    _id: "SHIFT001",
    doctor_id: "DOC001",
    date: "2025-10-27",
    start_time: "08:00",
    end_time: "12:00",
    maxPatients: 5, // Set to 5
    patients: ["PAT003"], // Patient already completed
    status: "active",
  },
  {
    _id: "SHIFT002",
    doctor_id: "DOC001",
    date: "2025-10-27",
    start_time: "13:00",
    end_time: "17:00",
    maxPatients: 5,
    patients: ["PAT003"], // Patient already approved
    status: "active",
  },
];

// --- PATIENT MOCK DATA ---
let mockPatients = [
  { _id: "PAT001", name: "Nguyen Van A", age: 30, phone: "0901234567" },
  { _id: "PAT002", name: "Tran Thi B", age: 25, phone: "0912345678" },
  { _id: "PAT003", name: "Le Van C", age: 40, phone: "0923456789" },
  { _id: "PAT004", name: "Pham Thi D", age: 55, phone: "0934567890" },
  { _id: "PAT005", name: "Hoang Van E", age: 28, phone: "0945678901" },
  { _id: "PAT006", name: "Do Thi F", age: 33, phone: "0956789012" }, // 6th patient
  { _id: "PAT007", name: "Vu Van G", age: 48, phone: "0967890123" }, // 7th patient
];

// --- APPOINTMENT MOCK DATA ---
// Shift 1 (max 5), has 6 appointments (1 COMPLETED, 5 SCHEDULED)
let mockAppointments = [
  { _id: "APT001", shiftId: "SHIFT001", patientId: "PAT001", status: "SCHEDULED", reason: "Khám tổng quát", createdAt: "2025-10-27T07:30:00Z" },
  { _id: "APT002", shiftId: "SHIFT001", patientId: "PAT002", status: "SCHEDULED", reason: "Khám bệnh theo lịch", createdAt: "2025-10-27T08:00:00Z" },
  { _id: "APT004", shiftId: "SHIFT001", patientId: "PAT003", status: "COMPLETED", reason: "Đã khám xong", createdAt: "2025-10-27T09:30:00Z" }, // Counts towards limit
  { _id: "APT007", shiftId: "SHIFT001", patientId: "PAT004", status: "SCHEDULED", reason: "Kiểm tra định kỳ", createdAt: "2025-10-27T10:30:00Z" },
  { _id: "APT008", shiftId: "SHIFT001", patientId: "PAT005", status: "SCHEDULED", reason: "Tư vấn sức khỏe", createdAt: "2025-10-27T10:45:00Z" },
  { _id: "APT009", shiftId: "SHIFT001", patientId: "PAT006", status: "SCHEDULED", reason: "Đau bụng", createdAt: "2025-10-27T11:00:00Z" }, // 6th appointment for Shift 1
  { _id: "APT0010", shiftId: "SHIFT001", patientId: "PAT007", status: "SCHEDULED", reason: "Đau bụng", createdAt: "2025-10-27T11:00:00Z" }, // 6th appointment for Shift 1
  { _id: "APT0011", shiftId: "SHIFT001", patientId: "PAT008", status: "SCHEDULED", reason: "Đau bụng", createdAt: "2025-10-27T11:00:00Z" }, // 6th appointment for Shift 1
  { _id: "APT0012", shiftId: "SHIFT001", patientId: "PAT009", status: "SCHEDULED", reason: "Đau bụng", createdAt: "2025-10-27T11:00:00Z" }, // 6th appointment for Shift 1

  // Shift 2 (max 5), has 4 appointments
  { _id: "APT003", shiftId: "SHIFT002", patientId: "PAT003", status: "APPROVE", reason: "Tái khám", createdAt: "2025-10-27T09:00:00Z" }, // Counts towards limit
  { _id: "APT005", shiftId: "SHIFT002", patientId: "PAT004", status: "SCHEDULED", reason: "Kiểm tra sức khỏe định kỳ", createdAt: "2025-10-27T10:00:00Z" },
  { _id: "APT006", shiftId: "SHIFT002", patientId: "PAT005", status: "SCHEDULED", reason: "Đau đầu", createdAt: "2025-10-27T10:15:00Z" },
  { _id: "APT014", shiftId: "SHIFT002", patientId: "PAT007", status: "SCHEDULED", reason: "Kiểm tra mắt", createdAt: "2025-10-27T13:30:00Z" },
];

let mockMedicalRecords = [];

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// --- SHIFT FUNCTIONS ---
export const getShifts = async (doctorId, date) => {
  await delay();
  // Calculate actual approved/completed count for display
  const shifts = mockShifts
    .filter((s) => s.doctor_id === doctorId && s.date === date)
    .map((shift) => {
      const approvedOrCompletedCount = mockAppointments.filter(
        (apt) => apt.shiftId === shift._id && ["APPROVE", "COMPLETED"].includes(apt.status)
      ).length;
      // Use approvedOrCompletedCount for display, not shift.patients.length
      return { ...shift, patientsCount: approvedOrCompletedCount };
    });
  return { success: true, data: shifts };
};

export const createShift = async (doctorId, shift) => {
  await delay();
  const newShift = {
    _id: "SHIFT" + Date.now(),
    doctor_id: doctorId,
    status: "active",
    patients: [], // This array is less relevant now for counting
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
    // No need to update patientsCount here
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
    const doctorShiftsToday = mockShifts.filter(
      (s) => s.doctor_id === doctorId && s.date === date
    );
    const shiftIds = doctorShiftsToday.map((s) => s._id);
    list = list.filter((apt) => shiftIds.includes(apt.shiftId));
  }

  const data = list.map((apt) => {
    const patient = mockPatients.find((p) => p._id === apt.patientId);
    const shift = mockShifts.find((s) => s._id === apt.shiftId);
    return { ...apt, patient, shift };
  });

  return { success: true, data };
};

// === UPDATED LOGIC TO CHECK IF SHIFT IS FULL ===
export const updateAppointmentStatus = async (appointmentId, newStatus) => {
  await delay();
  const index = mockAppointments.findIndex((a) => a._id === appointmentId);
  if (index === -1) {
    return { success: false, error: "Appointment not found" };
  }

  const appointment = mockAppointments[index];
  const shift = mockShifts.find((s) => s._id === appointment.shiftId);

  if (!shift) {
    console.warn("Shift not found for appointment:", appointmentId);
    // Update status anyway but return warning
    mockAppointments[index].status = newStatus;
    return { success: true, data: appointment, warning: "Shift not found" };
  }

  // CHECK SHIFT CAPACITY BEFORE APPROVING
  if (newStatus === "APPROVE") {
    // Count current approved or completed appointments for this shift
    const currentApprovedOrCompletedCount = mockAppointments.filter(
      (apt) => apt.shiftId === shift._id && ["APPROVE", "COMPLETED"].includes(apt.status)
    ).length;

    // If count is already at or above maxPatients, return error
    if (currentApprovedOrCompletedCount >= shift.maxPatients) {
      return { success: false, error: `Ca (${shift.start_time}-${shift.end_time}) đã đủ ${shift.maxPatients} bệnh nhân. Không thể duyệt thêm.` };
    }
  }
  // ============================================

  // If not full or status is not APPROVE, update the status
  mockAppointments[index].status = newStatus;

  // Update shift's patient array (Optional, as counting is done dynamically now)
  // const patientExistsInShift = shift.patients.includes(appointment.patientId);
  // if (newStatus === "APPROVE") {
  //    if (!patientExistsInShift) shift.patients.push(appointment.patientId);
  // } else if (["CANCELLED", "NO_SHOW"].includes(newStatus)) {
  //    if (patientExistsInShift) shift.patients = shift.patients.filter(pId => pId !== appointment.patientId);
  // }

  return { success: true, data: appointment };
};
// ===================================

// --- DASHBOARD FUNCTION ---
export const getDashboardStats = async (doctorId = "DOC001") => {
  await delay();
  const today = getLocalDate();

  const todayShifts = mockShifts.filter(
    (s) => s.doctor_id === doctorId && s.date === today
  );
  const todayShiftIds = todayShifts.map((s) => s._id);
  const todayAppointments = mockAppointments.filter((apt) =>
    todayShiftIds.includes(apt.shiftId)
  );

  const todayPatients = todayAppointments.filter((apt) =>
    ["APPROVE", "COMPLETED"].includes(apt.status)
  ).length;

  const upcomingAppointments = todayAppointments.filter((apt) =>
    ["SCHEDULED", "APPROVE", "COMPLETED"].includes(apt.status)
  ).length;

  const pendingRequests = todayAppointments.filter(
    (apt) => apt.status === "SCHEDULED"
  ).length;

  const stats = {
    todayPatients: todayPatients,
    upcomingAppointments: upcomingAppointments,
    appointmentChange: 5,
    pendingPrescriptions: 0,
    pendingRequests: pendingRequests,
    totalPatients: mockPatients.length,
  };

  return { success: true, data: stats };
};

// --- MEDICAL RECORD FUNCTION ---
export const createMedicalRecord = async (recordData) => {
  await delay();
  try {
    if (!recordData.doctor_id || !recordData.patient_id || !recordData.appointment_id) {
      throw new Error("Missing required IDs (doctor, patient, appointment).");
    }

    const newRecord = {
      _id: "REC" + Date.now(),
      diagnosis: recordData.diagnosis || "",
      symptoms: recordData.symptoms || [],
      notes: recordData.notes || "",
      attachments: [],
      access_requests: [],
      prescription: null,
      status: recordData.status || "PRIVATE",
      doctor_id: recordData.doctor_id,
      patient_id: recordData.patient_id,
      appointment_id: recordData.appointment_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockMedicalRecords.push(newRecord);
    console.log("Mock Medical Records:", mockMedicalRecords);

    return { success: true, data: newRecord };
  } catch (error) {
    console.error("Error creating medical record:", error);
    return { success: false, error: error.message };
  }
};