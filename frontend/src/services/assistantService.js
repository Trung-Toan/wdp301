// services/assistantService.js
// Mock service cho Assistant

// --- SHIFT MOCK DATA ---
let mockShifts = [
  {
    _id: "SHIFT001",
    doctor_id: "DOC001",
    // === SỬA NGÀY HÔM NAY ===
    date: "2025-10-27",
    start_time: "08:00",
    end_time: "12:00",
    maxPatients: 5,
    patients: ["PAT001", "PAT002"],
    status: "active",
  },
  {
    _id: "SHIFT002",
    doctor_id: "DOC001",
    // === SỬA NGÀY HÔM NAY ===
    date: "2025-10-27",
    start_time: "13:00",
    end_time: "17:00",
    maxPatients: 3,
    patients: [], // Ca này không có bệnh nhân
    status: "active",
  },
];

// --- PATIENT MOCK DATA ---
// (Chỉ giữ lại 1 mảng)
let mockPatients = [
  { _id: "PAT001", name: "Nguyen Van A", age: 30, phone: "0901234567" },
  { _id: "PAT002", name: "Tran Thi B", age: 25, phone: "0912345678" },
  { _id: "PAT003", name: "Le Van C", age: 40, phone: "0923456789" },
];

// --- APPOINTMENT MOCK DATA ---
// (Chỉ giữ lại 1 mảng)
let mockAppointments = [
  {
    _id: "APT001",
    shiftId: "SHIFT001", // Gán vào ca 1
    patientId: "PAT001",
    status: "SCHEDULED", // <-- Chờ duyệt
    reason: "Khám tổng quát",
    createdAt: "2025-10-27T07:30:00Z", // Sửa ngày
  },
  {
    _id: "APT002",
    shiftId: "SHIFT001", // Gán vào ca 1
    patientId: "PAT002",
    status: "SCHEDULED", // <-- Chờ duyệt
    reason: "Khám bệnh theo lịch",
    createdAt: "2025-10-27T08:00:00Z", // Sửa ngày
  },
  // Bạn có thể thêm data cho ca 2 nếu muốn
];

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// --- SHIFT FUNCTIONS ---
export const getShifts = async (doctorId, date) => {
  await delay();
  const shifts = mockShifts
    .filter((s) => s.doctor_id === doctorId && s.date === date)
    .map((s) => ({ ...s, patientsCount: s.patients.length }));
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
    mockShifts[index].patientsCount = mockShifts[index].patients.length;
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
    const shifts = mockShifts.filter(
      (s) => s.doctor_id === doctorId && s.date === date
    );
    const shiftIds = shifts.map((s) => s._id);
    list = list.filter((apt) => shiftIds.includes(apt.shiftId));
  }

  const data = list.map((apt) => {
    const patient = mockPatients.find((p) => p._id === apt.patientId);
    const shift = mockShifts.find((s) => s._id === apt.shiftId);
    return { ...apt, patient, shift };
  });

  return { success: true, data };
};

export const updateAppointmentStatus = async (appointmentId, newStatus) => {
  await delay();
  const index = mockAppointments.findIndex((a) => a._id === appointmentId);
  if (index !== -1) {
    mockAppointments[index].status = newStatus;

    // Logic này chưa chính xác lắm, đáng lẽ phải là 'COMPLETED'
    // Nhưng tôi giữ nguyên logic file của bạn
    if (newStatus === "SCHEDULED") {
      const shift = mockShifts.find(
        (s) => s._id === mockAppointments[index].shiftId
      );
      if (
        shift &&
        !shift.patients.includes(mockAppointments[index].patientId)
      ) {
        shift.patients.push(mockAppointments[index].patientId);
        shift.patientsCount = shift.patients.length;
      }
    }
    return { success: true, data: mockAppointments[index] };
  }
  return { success: false, error: "Appointment not found" };
};