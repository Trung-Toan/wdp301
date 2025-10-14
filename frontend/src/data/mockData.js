// Mock data for MongoDB collections
// This file contains sample data matching the actual MongoDB schema
// Replace with actual API calls when backend is ready

// Helper to get dates relative to today
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getTodayAt = (hours, minutes = 0) => {
  const date = getToday();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const getDaysFromNow = (days) => {
  const date = getToday();
  date.setDate(date.getDate() + days);
  return date;
};

// Account schema (referenced by User)
export const mockAccounts = [
  {
    _id: "ACC001",
    username: "nguyenvanan",
    email: "nguyenvanan@hospital.com",
    phone_number: "0901234567",
    password: "$2b$10$hashedpassword1", // hashed password
    status: "ACTIVE",
    role: "DOCTOR",
    resetPasswordOTP: null,
    resetPasswordExpires: null,
    createdAt: "2020-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "ACC002",
    username: "tranthibinh",
    email: "tranthibinh@hospital.com",
    phone_number: "0901234568",
    password: "$2b$10$hashedpassword2",
    status: "ACTIVE",
    role: "DOCTOR",
    resetPasswordOTP: null,
    resetPasswordExpires: null,
    createdAt: "2020-02-20T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "ACC003",
    username: "nguyenthihoa",
    email: "nguyenthihoa@email.com",
    phone_number: "0912345678",
    password: "$2b$10$hashedpassword3",
    status: "ACTIVE",
    role: "PATIENT",
    resetPasswordOTP: null,
    resetPasswordExpires: null,
    createdAt: "2022-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "ACC004",
    username: "tranvanminh",
    email: "tranvanminh@email.com",
    phone_number: "0923456789",
    password: "$2b$10$hashedpassword4",
    status: "ACTIVE",
    role: "PATIENT",
    resetPasswordOTP: null,
    resetPasswordExpires: null,
    createdAt: "2023-05-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "ACC005",
    username: "nguyenthilan",
    email: "nguyenthilan@email.com",
    phone_number: "0911111111",
    password: "$2b$10$hashedpassword5",
    status: "ACTIVE",
    role: "PATIENT",
    resetPasswordOTP: null,
    resetPasswordExpires: null,
    createdAt: "2021-03-20T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

// User schema (referenced by Doctor and Patient)
export const mockUsers = [
  {
    _id: "USER001",
    full_name: "BS. Nguyễn Văn An",
    dob: new Date("1980-05-15"),
    gender: "Nam",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    avatar_url: "/caring-doctor.png",
    account_id: "ACC001",
    createdAt: "2020-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "USER002",
    full_name: "BS. Trần Thị Bình",
    dob: new Date("1985-08-20"),
    gender: "Nữ",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    avatar_url: "/female-doctor.png",
    account_id: "ACC002",
    createdAt: "2020-02-20T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "USER003",
    full_name: "Nguyễn Thị Hoa",
    dob: new Date("1990-03-10"),
    gender: "Nữ",
    address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
    avatar_url: null,
    account_id: "ACC003",
    createdAt: "2022-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "USER004",
    full_name: "Trần Văn Minh",
    dob: new Date("1988-11-25"),
    gender: "Nam",
    address: "321 Võ Văn Tần, Quận 3, TP.HCM",
    avatar_url: null,
    account_id: "ACC004",
    createdAt: "2023-05-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "USER005",
    full_name: "Nguyễn Thị Lan",
    dob: new Date("1975-07-08"),
    gender: "Nữ",
    address: "654 Hai Bà Trưng, Quận 1, TP.HCM",
    avatar_url: null,
    account_id: "ACC005",
    createdAt: "2021-03-20T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

// Specialty schema
export const mockSpecialties = [
  {
    _id: "SPEC001",
    name: "Tim mạch",
    description: "Chuyên khoa tim mạch, điều trị các bệnh về tim và mạch máu",
    icon_url: "/icons/cardiology.png",
    status: "ACTIVE",
  },
  {
    _id: "SPEC002",
    name: "Nội khoa",
    description: "Chuyên khoa nội tổng quát",
    icon_url: "/icons/internal.png",
    status: "ACTIVE",
  },
  {
    _id: "SPEC003",
    name: "Nhi khoa",
    description: "Chuyên khoa nhi, chăm sóc sức khỏe trẻ em",
    icon_url: "/icons/pediatrics.png",
    status: "ACTIVE",
  },
];

// Address schema (referenced by Clinic)
export const mockAddresses = [
  {
    _id: "ADDR001",
    street: "123 Nguyễn Huệ",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    country: "Việt Nam",
  },
];

// Clinic schema
export const mockClinics = [
  {
    _id: "CLI001",
    name: "Phòng khám Đa khoa Quốc tế",
    phone: "0281234567",
    email: "contact@clinic.com",
    website: ["https://clinic.com"],
    description:
      "Phòng khám đa khoa uy tín với đội ngũ bác sĩ giàu kinh nghiệm",
    logo_url: "/clinic-logo.png",
    banner_url: "/clinic-banner.png",
    tax_code: "0123456789",
    registration_number: "REG-2020-001",
    opening_hours: "08:00",
    closing_hours: "20:00",
    status: "ACTIVE",
    longitude: "106.7008",
    latitude: "10.7756",
    specialty_id: "SPEC001",
    address_id: "ADDR001",
    createdAt: "2020-01-15T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// Doctor schema
export const mockDoctors = [
  {
    _id: "DOC001",
    title: "Tiến sĩ",
    degree: "Bác sĩ chuyên khoa II Tim mạch",
    workplace: "Bệnh viện Chợ Rẫy",
    rating: 4.8,
    clinic_id: "CLI001",
    specialty_id: "SPEC001",
    user_id: "USER001",
    createdAt: "2020-06-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "DOC002",
    title: "Thạc sĩ",
    degree: "Bác sĩ chuyên khoa I Nội khoa",
    workplace: "Bệnh viện Đại học Y Dược",
    rating: 4.5,
    clinic_id: "CLI001",
    specialty_id: "SPEC002",
    user_id: "USER002",
    createdAt: "2021-03-20T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
];

// License schema
export const mockLicenses = [
  {
    _id: "LIC001",
    license_number: "BYT-12345-2010",
    issued_by: "Bộ Y Tế Việt Nam",
    issued_date: new Date("2010-06-15"),
    expiry_date: new Date("2025-06-15"),
    document_url: ["/documents/license-doc001.pdf"],
    status: "APPROVED",
    approved_at: new Date("2010-06-20"),
    rejected_reason: null,
    doctor_id: "DOC001",
    approved_by: "ADMIN001",
    createdAt: "2010-06-15T00:00:00Z",
    updatedAt: "2010-06-20T00:00:00Z",
  },
  {
    _id: "LIC002",
    license_number: "BYT-67890-2015",
    issued_by: "Bộ Y Tế Việt Nam",
    issued_date: new Date("2015-08-20"),
    expiry_date: new Date("2025-08-20"),
    document_url: ["/documents/license-doc002.pdf"],
    status: "APPROVED",
    approved_at: new Date("2015-08-25"),
    rejected_reason: null,
    doctor_id: "DOC002",
    approved_by: "ADMIN001",
    createdAt: "2015-08-20T00:00:00Z",
    updatedAt: "2015-08-25T00:00:00Z",
  },
];

// Patient schema
export const mockPatients = [
  {
    _id: "PAT001",
    blood_type: "A+",
    allergies: ["Penicillin"],
    chronic_diseases: ["Cao huyết áp"],
    medications: ["Amlodipine 5mg"],
    surgery_history: [],
    user_id: "USER003",
    createdAt: "2022-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "PAT002",
    blood_type: "O+",
    allergies: [],
    chronic_diseases: [],
    medications: [],
    surgery_history: [],
    user_id: "USER004",
    createdAt: "2023-05-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "PAT003",
    blood_type: "B+",
    allergies: ["Sulfa drugs"],
    chronic_diseases: ["Đái tháo đường type 2", "Rối loạn lipid máu"],
    medications: ["Metformin 500mg"],
    surgery_history: ["Phẫu thuật tim mạch - 2023-12-01"],
    user_id: "USER005",
    createdAt: "2021-03-20T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
];

// Assistant schema
export const mockAssistants = [
  {
    _id: "AST001",
    full_name: "Nguyễn Thị Lan",
    email: "nguyenthilan@hospital.com",
    phone: "0911111111",
    avatar: "/diverse-nurses-team.png",
    doctor_id: "DOC001",
    status: "active",
    hired_date: "2022-01-15",
  },
  {
    _id: "AST002",
    full_name: "Trần Văn Hùng",
    email: "tranvanhung@hospital.com",
    phone: "0922222222",
    avatar: "/male-nurse.png",
    doctor_id: "DOC001",
    status: "active",
    hired_date: "2023-03-20",
  },
];

// Slot schema
export const mockSlots = [
  {
    _id: "SLOT001",
    start_time: getTodayAt(8, 0),
    end_time: getTodayAt(8, 30),
    status: "BOOKED",
    max_patients: 1,
    note: "",
    doctor_id: "DOC001",
    clinic_id: "CLI001",
    created_by: "AST001",
  },
  {
    _id: "SLOT002",
    start_time: getTodayAt(8, 30),
    end_time: getTodayAt(9, 0),
    status: "AVAIABLE",
    max_patients: 1,
    note: "",
    doctor_id: "DOC001",
    clinic_id: "CLI001",
    created_by: "AST001",
  },
  {
    _id: "SLOT003",
    start_time: getTodayAt(9, 0),
    end_time: getTodayAt(9, 30),
    status: "BOOKED",
    max_patients: 1,
    note: "",
    doctor_id: "DOC001",
    clinic_id: "CLI001",
    created_by: "AST001",
  },
  {
    _id: "SLOT004",
    start_time: getTodayAt(10, 0),
    end_time: getTodayAt(10, 30),
    status: "BOOKED",
    max_patients: 1,
    note: "",
    doctor_id: "DOC001",
    clinic_id: "CLI001",
    created_by: "AST001",
  },
  {
    _id: "SLOT005",
    start_time: getTodayAt(11, 0),
    end_time: getTodayAt(11, 30),
    status: "BOOKED",
    max_patients: 1,
    note: "",
    doctor_id: "DOC001",
    clinic_id: "CLI001",
    created_by: "AST001",
  },
  {
    _id: "SLOT006",
    start_time: getTodayAt(14, 0),
    end_time: getTodayAt(14, 30),
    status: "AVAIABLE",
    max_patients: 1,
    note: "",
    doctor_id: "DOC001",
    clinic_id: "CLI001",
    created_by: "AST001",
  },
  {
    _id: "SLOT007",
    start_time: getTodayAt(15, 0),
    end_time: getTodayAt(15, 30),
    status: "BOOKED",
    max_patients: 1,
    note: "",
    doctor_id: "DOC001",
    clinic_id: "CLI001",
    created_by: "AST001",
  },
  // Tomorrow's slots
  {
    _id: "SLOT008",
    start_time: new Date(getDaysFromNow(1).setHours(9, 0, 0, 0)),
    end_time: new Date(getDaysFromNow(1).setHours(9, 30, 0, 0)),
    status: "BOOKED",
    max_patients: 1,
    note: "",
    doctor_id: "DOC001",
    clinic_id: "CLI001",
    created_by: "AST001",
  },
  {
    _id: "SLOT009",
    start_time: new Date(getDaysFromNow(1).setHours(10, 0, 0, 0)),
    end_time: new Date(getDaysFromNow(1).setHours(10, 30, 0, 0)),
    status: "AVAIABLE",
    max_patients: 1,
    note: "",
    doctor_id: "DOC001",
    clinic_id: "CLI001",
    created_by: "AST001",
  },
];

// Appointment schema
export const mockAppointments = [
  {
    _id: "APT001",
    reason: "Khám định kỳ tim mạch",
    status: "SCHEDULED",
    slot_id: "SLOT001",
    doctor_id: "DOC001",
    patient_id: "PAT001",
    clinic_id: "CLI001",
    specialty_id: "SPEC001",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    _id: "APT002",
    reason: "Đau ngực, khó thở",
    status: "SCHEDULED",
    slot_id: "SLOT003",
    doctor_id: "DOC001",
    patient_id: "PAT002",
    clinic_id: "CLI001",
    specialty_id: "SPEC001",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    _id: "APT003",
    reason: "Tái khám sau phẫu thuật",
    status: "SCHEDULED",
    slot_id: "SLOT004",
    doctor_id: "DOC001",
    patient_id: "PAT003",
    clinic_id: "CLI001",
    specialty_id: "SPEC001",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    _id: "APT004",
    reason: "Kiểm tra huyết áp",
    status: "SCHEDULED",
    slot_id: "SLOT005",
    doctor_id: "DOC001",
    patient_id: "PAT001",
    clinic_id: "CLI001",
    specialty_id: "SPEC001",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    _id: "APT005",
    reason: "Khám tổng quát",
    status: "SCHEDULED",
    slot_id: "SLOT007",
    doctor_id: "DOC001",
    patient_id: "PAT002",
    clinic_id: "CLI001",
    specialty_id: "SPEC001",
    createdAt: new Date().toISOString(), // today
  },
  {
    _id: "APT006",
    reason: "Tư vấn dinh dưỡng",
    status: "SCHEDULED",
    slot_id: "SLOT008",
    doctor_id: "DOC001",
    patient_id: "PAT003",
    clinic_id: "CLI001",
    specialty_id: "SPEC001",
    createdAt: new Date().toISOString(), // today
  },
  {
    _id: "APT007",
    reason: "Khám bệnh lần đầu",
    status: "COMPLETED",
    slot_id: "SLOT010",
    doctor_id: "DOC001",
    patient_id: "PAT001",
    clinic_id: "CLI001",
    specialty_id: "SPEC001",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
];

// Medicine subdocument (part of Prescription)
const sampleMedicines = [
  {
    name: "Amlodipine 5mg",
    dosage: "1 viên",
    frequency: "1 lần/ngày vào buổi sáng",
    duration: "30 ngày",
    note: "Uống sau ăn",
  },
  {
    name: "Losartan 50mg",
    dosage: "1 viên",
    frequency: "1 lần/ngày vào buổi tối",
    duration: "30 ngày",
    note: "Uống trước khi ngủ",
  },
];

// Prescription subdocument (part of MedicalRecord)
const samplePrescriptions = [
  {
    medicines: sampleMedicines,
    instruction:
      "Uống thuốc đều đặn, không tự ý ngừng thuốc. Theo dõi huyết áp hàng ngày.",
    verified_at: null,
    created_by: "DOC001",
  },
  {
    medicines: [
      {
        name: "Aspirin 100mg",
        dosage: "1 viên",
        frequency: "1 lần/ngày vào buổi sáng",
        duration: "90 ngày",
        note: "Uống sau ăn sáng",
      },
    ],
    instruction: "Tiếp tục điều trị dài hạn. Tái khám sau 3 tháng.",
    verified_at: new Date("2024-01-15T11:45:00Z"),
    created_by: "DOC001",
  },
];

// AccessRequest subdocument (part of MedicalRecord)
const sampleAccessRequests = [
  {
    doctor_id: "DOC002",
    status: "PENDING",
    requested_at: new Date("2024-01-14T10:00:00Z"),
    approved_at: null,
    date_expired: null,
  },
  {
    doctor_id: "DOC001",
    status: "APPROVED",
    requested_at: new Date("2024-01-12T09:00:00Z"),
    approved_at: new Date("2024-01-12T10:30:00Z"),
    date_expired: new Date("2024-02-12T10:30:00Z"),
  },
];

// Feedback schema
export const mockFeedback = [
  {
    _id: "FB001",
    rating: 5,
    comment:
      "Bác sĩ rất tận tâm và chuyên nghiệp. Giải thích rõ ràng về tình trạng bệnh.",
    is_anonymous: true,
    patient_id: "PAT001",
    doctor_id: "DOC001",
    createdAt: "2024-01-15T16:00:00Z",
  },
  {
    _id: "FB002",
    rating: 4,
    comment: "Khám bệnh kỹ lưỡng, tuy nhiên thời gian chờ hơi lâu.",
    is_anonymous: true,
    patient_id: "PAT002",
    doctor_id: "DOC001",
    createdAt: "2024-01-14T18:30:00Z",
  },
  {
    _id: "FB003",
    rating: 5,
    comment:
      "Rất hài lòng với quá trình điều trị. Bác sĩ theo dõi sát sao sau phẫu thuật.",
    is_anonymous: true,
    patient_id: "PAT003",
    doctor_id: "DOC001",
    createdAt: "2024-01-13T20:00:00Z",
  },
];

// MedicalRecord schema
export const mockMedicalRecords = [
  {
    _id: "MR001",
    diagnosis: "Cao huyết áp độ 2",
    symptoms: ["Đau đầu", "Chóng mặt", "Mệt mỏi"],
    notes: "Bệnh nhân cần kiểm soát chế độ ăn, tập thể dục đều đặn",
    attachments: ["/attachments/xray-001.jpg", "/attachments/ecg-001.pdf"],
    access_requests: [sampleAccessRequests[0]],
    prescription: samplePrescriptions[0],
    status: "PRIVATE",
    doctor_id: "DOC001",
    patient_id: "PAT001",
    createdAt: "2024-01-15T09:30:00Z",
    updatedAt: "2024-01-15T09:30:00Z",
  },
  {
    _id: "MR002",
    diagnosis: "Hậu phẫu tim mạch - Phục hồi tốt",
    symptoms: [],
    notes: "Vết mổ lành tốt, không có dấu hiệu nhiễm trùng",
    attachments: ["/attachments/post-surgery-001.jpg"],
    access_requests: [],
    prescription: samplePrescriptions[1],
    status: "PRIVATE",
    doctor_id: "DOC001",
    patient_id: "PAT003",
    createdAt: "2024-01-15T11:30:00Z",
    updatedAt: "2024-01-15T11:30:00Z",
  },
  {
    _id: "MR003",
    diagnosis: "Viêm họng cấp",
    symptoms: ["Đau họng", "Sốt nhẹ", "Ho"],
    notes: "Nghỉ ngơi, uống nhiều nước",
    attachments: [],
    access_requests: [sampleAccessRequests[1]],
    prescription: {
      medicines: [
        {
          name: "Paracetamol 500mg",
          dosage: "1-2 viên",
          frequency: "Khi sốt hoặc đau",
          duration: "5 ngày",
          note: "Không quá 8 viên/ngày",
        },
      ],
      instruction:
        "Nghỉ ngơi, uống nhiều nước. Tái khám nếu không đỡ sau 3 ngày.",
      verified_at: new Date("2024-01-10T15:00:00Z"),
      created_by: "DOC001",
    },
    status: "PUBLIC",
    doctor_id: "DOC001",
    patient_id: "PAT002",
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T15:00:00Z",
  },
];

// Absence notifications (custom collection for doctor absences)
export const mockAbsences = [
  {
    _id: "ABS001",
    doctor_id: "DOC001",
    start_date: new Date("2024-02-01"),
    end_date: new Date("2024-02-05"),
    reason: "Nghỉ phép",
    status: "approved",
    created_at: new Date("2024-01-10T10:00:00Z"),
    approved_by: "ADMIN001",
    approved_at: new Date("2024-01-11T09:00:00Z"),
  },
  {
    _id: "ABS002",
    doctor_id: "DOC001",
    start_date: new Date("2024-03-15"),
    end_date: new Date("2024-03-17"),
    reason: "Tham gia hội nghị y khoa",
    status: "pending",
    created_at: new Date("2024-01-14T14:00:00Z"),
    approved_by: null,
    approved_at: null,
  },
];

// Dashboard statistics helper
export const mockDashboardStats = {
  todayPatients: 12,
  yesterdayPatients: 10,
  appointmentChange: 15.3, // percentage
  pendingPrescriptions: 2, // prescriptions without verified_at
  pendingRequests: 1, // access requests with PENDING status
  totalPatients: 248,
  upcomingAppointments: 8,
  completedAppointmentsToday: 4,
  cancelledAppointmentsToday: 1,
  averageRating: 4.7,
  totalFeedback: 156,
};

// Helper functions to work with the data

// Get populated doctor data (with user info)
export const getPopulatedDoctor = (doctorId) => {
  const doctor = mockDoctors.find((d) => d._id === doctorId);
  if (!doctor) return null;

  const user = mockUsers.find((u) => u._id === doctor.user_id);
  const account = user ? mockAccounts.find((a) => a._id === user.account_id) : null
  const specialty = mockSpecialties.find((s) => s._id === doctor.specialty_id);
  const clinic = mockClinics.find((c) => c._id === doctor.clinic_id);

  return {
    ...doctor,
    user: user
      ? {
          ...user,
          account_id: account, // Populate account reference
        }
      : null,
    specialty,
    clinic,
  };
};

// Get populated patient data (with user info)
export const getPopulatedPatient = (patientId) => {
  const patient = mockPatients.find((p) => p._id === patientId);
  if (!patient) return null;

  const user = mockUsers.find((u) => u._id === patient.user_id);
  const account = user ? mockAccounts.find((a) => a._id === user.account_id) : null

  return {
    ...patient,
    user: user
      ? {
          ...user,
          account_id: account, // Populate account reference
        }
      : null,
  };
};

// Get populated appointment data
export const getPopulatedAppointment = (appointmentId) => {
  const appointment = mockAppointments.find((a) => a._id === appointmentId);
  if (!appointment) return null;

  const doctor = getPopulatedDoctor(appointment.doctor_id);
  const patient = getPopulatedPatient(appointment.patient_id);
  const slot = mockSlots.find((s) => s._id === appointment.slot_id);
  const specialty = mockSpecialties.find(
    (s) => s._id === appointment.specialty_id
  );
  const clinic = mockClinics.find((c) => c._id === appointment.clinic_id);

  return {
    ...appointment,
    doctor,
    patient,
    slot,
    specialty,
    clinic,
  };
};

// Get today's appointments
export const getTodayAppointments = () => {
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return mockAppointments
    .filter((apt) => {
      const slot = mockSlots.find((s) => s._id === apt.slot_id);
      if (!slot) return false;
      const slotDate = new Date(slot.start_time);
      return slotDate >= today && slotDate < tomorrow;
    })
    .map((apt) => getPopulatedAppointment(apt._id));
};

// Get pending prescriptions (not verified)
export const getPendingPrescriptions = () => {
  return mockMedicalRecords
    .filter((record) => record.prescription && !record.prescription.verified_at)
    .map((record) => ({
      ...record,
      patient: getPopulatedPatient(record.patient_id),
      doctor: getPopulatedDoctor(record.doctor_id),
    }));
};

// Get pending access requests
export const getPendingAccessRequests = () => {
  const requests = [];
  mockMedicalRecords.forEach((record) => {
    if (record.access_requests && record.access_requests.length > 0) {
      record.access_requests.forEach((request) => {
        if (request.status === "PENDING") {
          requests.push({
            ...request,
            medical_record_id: record._id,
            patient: getPopulatedPatient(record.patient_id),
            requesting_doctor: getPopulatedDoctor(request.doctor_id),
          });
        }
      });
    }
  });
  return requests;
};
