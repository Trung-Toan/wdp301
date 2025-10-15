// services/assistantService.js
// Mock service cho Assistant

let mockShifts = [
  {
    _id: "SHIFT001",
    doctor_id: "DOC001",
    date: "2025-10-14",
    start_time: "08:00",
    end_time: "12:00",
    maxPatients: 5,
    patients: ["PAT001", "PAT002"], // chỉ lưu id patient
    status: "active",
  },
  {
    _id: "SHIFT002",
    doctor_id: "DOC001",
    date: "2025-10-14",
    start_time: "13:00",
    end_time: "17:00",
    maxPatients: 3,
    patients: [],
    status: "active",
  },
];

let mockPatients = [
  { _id: "PAT001", name: "Nguyen Van A", age: 30, phone: "0901234567" },
  { _id: "PAT002", name: "Tran Thi B", age: 25, phone: "0912345678" },
];

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const getShifts = async (doctorId, date) => {
  await delay();
  const shifts = mockShifts
    .filter((s) => s.doctor_id === doctorId && s.date === date)
    .map((s) => ({
      ...s,
      patientsCount: s.patients.length,
    }));
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

export const getPatients = async () => {
  await delay();
  return { success: true, data: mockPatients };
};
