// Account schema (referenced by User)
export const mockAccounts = [
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
];

// User schema (referenced by Doctor and Patient)
export const mockUsers = [
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

// Get populated patient data (with user info)
export const getPopulatedPatient = (patientId) => {
  const patient = mockPatients.find((p) => p._id === patientId);
  if (!patient) return null;

  const user = mockUsers.find((u) => u._id === patient.user_id);
  const account = user
    ? mockAccounts.find((a) => a._id === user.account_id)
    : null;

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

// ============================================
// MONGODB SAMPLE DATA (DOCTOR/CLINIC/ASSISTANT)
// ============================================

// ============================================
// ACCOUNT COLLECTION
// ============================================
export const sampleAccounts = [
  {
    _id: "68e4fb9303bb8005b8f4c0fe",
    username: "toantt",
    email: "trantrungtoan17092003@gmail.com",
    phone_number: "0818681561",
    password: "$2b$10$hashedpassword", // hashed password
    status: "ACTIVE",
    role: "DOCTOR",
    email_verified: true,
    createdAt: new Date("2025-10-07T11:37:55.797Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f1",
    username: "nguyenvanan",
    email: "nguyenvanan@hospital.com",
    phone_number: "0901234567",
    password: "$2b$10$hashedpassword2",
    status: "ACTIVE",
    role: "DOCTOR",
    email_verified: true,
    createdAt: new Date("2025-09-15T08:20:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f2",
    username: "tranthibinh",
    email: "tranthibinh@hospital.com",
    phone_number: "0901234568",
    password: "$2b$10$hashedpassword3",
    status: "ACTIVE",
    role: "DOCTOR",
    email_verified: true,
    createdAt: new Date("2025-08-20T10:15:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f3",
    username: "nguyenthihoa",
    email: "nguyenthihoa@email.com",
    phone_number: "0912345678",
    password: "$2b$10$hashedpassword4",
    status: "ACTIVE",
    role: "ASSISTANT",
    email_verified: true,
    createdAt: new Date("2025-09-01T14:30:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f4",
    username: "tranvanminh",
    email: "tranvanminh@email.com",
    phone_number: "0923456789",
    password: "$2b$10$hashedpassword5",
    status: "ACTIVE",
    role: "ASSISTANT",
    email_verified: true,
    createdAt: new Date("2025-09-10T09:45:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
];

// ============================================
// USER COLLECTION
// ============================================
export const sampleUsers = [
  {
    _id: "68e4fb9303bb8005b8f4c0fe",
    full_name: "Trần Trung Toàn",
    dob: new Date("1990-09-17"),
    gender: "Nam",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    avatar_url: "https://example.com/avatar/toan.jpg",
    account_id: "68e4fb9303bb8005b8f4c0fe",
    notify_upcoming: true,
    notify_results: true,
    notify_marketing: false,
    privacy_allow_doctor_view: true,
    privacy_share_with_providers: false,
    createdAt: new Date("2025-10-07T11:37:55.797Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f1",
    full_name: "BS. Nguyễn Văn An",
    dob: new Date("1980-05-15"),
    gender: "Nam",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    avatar_url: "https://example.com/avatar/an.jpg",
    account_id: "68e4fb9303bb8005b8f4c0f1",
    notify_upcoming: true,
    notify_results: true,
    notify_marketing: false,
    privacy_allow_doctor_view: true,
    privacy_share_with_providers: true,
    createdAt: new Date("2025-09-15T08:20:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f2",
    full_name: "BS. Trần Thị Bình",
    dob: new Date("1985-08-20"),
    gender: "Nữ",
    address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
    avatar_url: "https://example.com/avatar/binh.jpg",
    account_id: "68e4fb9303bb8005b8f4c0f2",
    notify_upcoming: true,
    notify_results: true,
    notify_marketing: false,
    privacy_allow_doctor_view: true,
    privacy_share_with_providers: true,
    createdAt: new Date("2025-08-20T10:15:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f3",
    full_name: "Nguyễn Thị Hoa",
    dob: new Date("1992-03-10"),
    gender: "Nữ",
    address: "321 Võ Văn Tần, Quận 3, TP.HCM",
    avatar_url: "https://example.com/avatar/hoa.jpg",
    account_id: "68e4fb9303bb8005b8f4c0f3",
    notify_upcoming: true,
    notify_results: true,
    notify_marketing: false,
    privacy_allow_doctor_view: true,
    privacy_share_with_providers: false,
    createdAt: new Date("2025-09-01T14:30:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f4",
    full_name: "Trần Văn Minh",
    dob: new Date("1988-11-25"),
    gender: "Nam",
    address: "654 Hai Bà Trưng, Quận 1, TP.HCM",
    avatar_url: "https://example.com/avatar/minh.jpg",
    account_id: "68e4fb9303bb8005b8f4c0f4",
    notify_upcoming: true,
    notify_results: true,
    notify_marketing: false,
    privacy_allow_doctor_view: true,
    privacy_share_with_providers: false,
    createdAt: new Date("2025-09-10T09:45:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
];

// ============================================
// SPECIALTY COLLECTION
// ============================================
export const sampleSpecialties = [
  {
    _id: "65a1b2c3d4e5f6g7h8i9j0k1",
    name: "Tim mạch",
    description: "Chuyên khoa tim mạch, điều trị các bệnh về tim và mạch máu",
    icon_url: "https://example.com/icons/cardiology.png",
    status: "ACTIVE",
  },
  {
    _id: "65a1b2c3d4e5f6g7h8i9j0k2",
    name: "Nội khoa",
    description: "Chuyên khoa nội tổng quát",
    icon_url: "https://example.com/icons/internal.png",
    status: "ACTIVE",
  },
  {
    _id: "65a1b2c3d4e5f6g7h8i9j0k3",
    name: "Nhi khoa",
    description: "Chuyên khoa nhi, chăm sóc sức khỏe trẻ em",
    icon_url: "https://example.com/icons/pediatrics.png",
    status: "ACTIVE",
  },
  {
    _id: "65a1b2c3d4e5f6g7h8i9j0k4",
    name: "Ngoại khoa",
    description: "Chuyên khoa ngoại tổng quát",
    icon_url: "https://example.com/icons/surgery.png",
    status: "ACTIVE",
  },
];

// ============================================
// CLINIC COLLECTION
// ============================================
export const sampleClinics = [
  {
    _id: "65a1b2c3d4e5f6g7h8i9j0k5",
    name: "Phòng khám Đa khoa Quốc tế",
    phone: "0281234567",
    email: "contact@clinic.com",
    website: "https://clinic.com",
    description:
      "Phòng khám đa khoa uy tín với đội ngũ bác sĩ giàu kinh nghiệm",
    logo_url: "https://example.com/clinic-logo.png",
    banner_url: "https://example.com/clinic-banner.png",
    registration_number: "REG-2020-001",
    opening_hours: "08:00",
    closing_hours: "20:00",
    status: "ACTIVE",
    created_by: "65a1b2c3d4e5f6g7h8i9j0k6",
    address_detail: "65a1b2c3d4e5f6g7h8i9j0k7",
    address: {
      province: {
        code: "79",
        name: "TP. Hồ Chí Minh",
      },
      ward: {
        code: "00001",
        name: "Phường Bến Nghé",
      },
      houseNumber: "123",
      street: "Nguyễn Huệ",
      alley: "Hẻm 5",
      fullAddress: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    },
    specialties: [
      "65a1b2c3d4e5f6g7h8i9j0k1",
      "65a1b2c3d4e5f6g7h8i9j0k2",
      "65a1b2c3d4e5f6g7h8i9j0k3",
    ],
    createdAt: new Date("2025-01-15T00:00:00Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "65a1b2c3d4e5f6g7h8i9j0k8",
    name: "Bệnh viện Chợ Rẫy",
    phone: "0287654321",
    email: "info@choray.com",
    website: "https://choray.com",
    description: "Bệnh viện đa khoa hàng đầu tại TP.HCM",
    logo_url: "https://example.com/choray-logo.png",
    banner_url: "https://example.com/choray-banner.png",
    registration_number: "REG-1990-001",
    opening_hours: "07:00",
    closing_hours: "22:00",
    status: "ACTIVE",
    created_by: "65a1b2c3d4e5f6g7h8i9j0k6",
    address_detail: "65a1b2c3d4e5f6g7h8i9j0k9",
    address: {
      province: {
        code: "79",
        name: "TP. Hồ Chí Minh",
      },
      ward: {
        code: "00002",
        name: "Phường 1",
      },
      houseNumber: "201",
      street: "Nguyễn Chí Thanh",
      alley: "",
      fullAddress: "201 Nguyễn Chí Thanh, Phường 1, Quận 5, TP. Hồ Chí Minh",
    },
    specialties: [
      "65a1b2c3d4e5f6g7h8i9j0k1",
      "65a1b2c3d4e5f6g7h8i9j0k2",
      "65a1b2c3d4e5f6g7h8i9j0k3",
      "65a1b2c3d4e5f6g7h8i9j0k4",
    ],
    createdAt: new Date("2025-01-10T00:00:00Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
];

// ============================================
// DOCTOR COLLECTION - Matches exact schema
// ============================================
export const sampleDoctors = [
  {
    _id: "68e4fb9303bb8005b8f4c0fe",
    title: "Tiến sĩ",
    degree: "Bác sĩ chuyên khoa II Tim mạch",
    avatar_url: "https://example.com/doctors/toan.jpg",
    workplace: "Bệnh viện Chợ Rẫy",
    rating: 4.8,
    clinic_id: "65a1b2c3d4e5f6g7h8i9j0k5",
    specialty_id: ["65a1b2c3d4e5f6g7h8i9j0k1"],
    user_id: "68e4fb9303bb8005b8f4c0fe",
    description:
      "Bác sĩ Trần Trung Toàn là chuyên gia tim mạch hàng đầu với 15 năm kinh nghiệm. Chuyên điều trị các bệnh tim mạch phức tạp.",
    experience: "15 năm kinh nghiệm trong lĩnh vực tim mạch",
    createdAt: new Date("2025-10-07T11:37:55.797Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f1",
    title: "Thạc sĩ",
    degree: "Bác sĩ chuyên khoa I Nội khoa",
    avatar_url: "https://example.com/doctors/an.jpg",
    workplace: "Phòng khám Đa khoa Quốc tế",
    rating: 4.6,
    clinic_id: "65a1b2c3d4e5f6g7h8i9j0k5",
    specialty_id: ["65a1b2c3d4e5f6g7h8i9j0k2"],
    user_id: "68e4fb9303bb8005b8f4c0f1",
    description:
      "Bác sĩ Nguyễn Văn An là chuyên gia nội khoa với 12 năm kinh nghiệm. Chuyên điều trị các bệnh nội tổng quát.",
    experience: "12 năm kinh nghiệm trong lĩnh vực nội khoa",
    createdAt: new Date("2025-09-15T08:20:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f2",
    title: "Thạc sĩ",
    degree: "Bác sĩ chuyên khoa I Nhi khoa",
    avatar_url: "https://example.com/doctors/binh.jpg",
    workplace: "Bệnh viện Chợ Rẫy",
    rating: 4.7,
    clinic_id: "65a1b2c3d4e5f6g7h8i9j0k8",
    specialty_id: ["65a1b2c3d4e5f6g7h8i9j0k3"],
    user_id: "68e4fb9303bb8005b8f4c0f2",
    description:
      "Bác sĩ Trần Thị Bình là chuyên gia nhi khoa với 10 năm kinh nghiệm. Chuyên chăm sóc sức khỏe trẻ em.",
    experience: "10 năm kinh nghiệm trong lĩnh vực nhi khoa",
    createdAt: new Date("2025-08-20T10:15:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
];

// ============================================
// ASSISTANT COLLECTION - Matches exact schema
// ============================================
export const sampleAssistants = [
  {
    _id: "68e4fb9303bb8005b8f4c0f3",
    note: "Trợ lý chính của bác sĩ Toàn, kinh nghiệm 5 năm",
    doctor_id: "68e4fb9303bb8005b8f4c0fe",
    clinic_id: "65a1b2c3d4e5f6g7h8i9j0k5",
    user_id: "68e4fb9303bb8005b8f4c0f3",
    createdAt: new Date("2025-09-01T14:30:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
  {
    _id: "68e4fb9303bb8005b8f4c0f4",
    note: "Trợ lý phòng khám, hỗ trợ bác sĩ An",
    doctor_id: "68e4fb9303bb8005b8f4c0f1",
    clinic_id: "65a1b2c3d4e5f6g7h8i9j0k5",
    user_id: "68e4fb9303bb8005b8f4c0f4",
    createdAt: new Date("2025-09-10T09:45:00.000Z"),
    updatedAt: new Date("2025-10-07T11:37:55.797Z"),
  },
];

// ============================================
// HELPER FUNCTIONS (for sample... data)
// ============================================

/**
 * Get populated doctor data with all references
 * @param {string} doctorId - Doctor ID
 * @returns {object} Populated doctor object
 */
export const getPopulatedDoctor = (doctorId) => {
  const doctor = sampleDoctors.find((d) => d._id === doctorId);
  if (!doctor) return null;

  const user = sampleUsers.find((u) => u._id === doctor.user_id);
  const account = user
    ? sampleAccounts.find((a) => a._id === user.account_id)
    : null;
  const clinic = sampleClinics.find((c) => c._id === doctor.clinic_id);
  const specialties = doctor.specialty_id.map((id) =>
    sampleSpecialties.find((s) => s._id === id)
  );

  return {
    ...doctor,
    user: user
      ? {
          ...user,
          account,
        }
      : null,
    clinic,
    specialties,
  };
};

/**
 * Get populated assistant data with all references
 * @param {string} assistantId - Assistant ID
 * @returns {object} Populated assistant object
 */
export const getPopulatedAssistant = (assistantId) => {
  const assistant = sampleAssistants.find((a) => a._id === assistantId);
  if (!assistant) return null;

  const user = sampleUsers.find((u) => u._id === assistant.user_id);
  const account = user
    ? sampleAccounts.find((a) => a._id === user.account_id)
    : null;
  const doctor = getPopulatedDoctor(assistant.doctor_id);
  const clinic = sampleClinics.find((c) => c._id === assistant.clinic_id);

  return {
    ...assistant,
    user: user
      ? {
          ...user,
          account,
        }
      : null,
    doctor,
    clinic,
  };
};

/**
 * Get all doctors for a clinic
 * @param {string} clinicId - Clinic ID
 * @returns {array} Array of populated doctors
 */
export const getDoctorsByClinic = (clinicId) => {
  return sampleDoctors
    .filter((d) => d.clinic_id === clinicId)
    .map((d) => getPopulatedDoctor(d._id));
};

/**
 * Get all assistants for a doctor
 * @param {string} doctorId - Doctor ID
 * @returns {array} Array of populated assistants
 */
export const getAssistantsByDoctor = (doctorId) => {
  return sampleAssistants
    .filter((a) => a.doctor_id === doctorId)
    .map((a) => getPopulatedAssistant(a._id));
};

/**
 * Get all assistants for a clinic
 * @param {string} clinicId - Clinic ID
 * @returns {array} Array of populated assistants
 */
export const getAssistantsByClinic = (clinicId) => {
  return sampleAssistants
    .filter((a) => a.clinic_id === clinicId)
    .map((a) => getPopulatedAssistant(a._id));
};

/**
 * Get doctors by specialty
 * @param {string} specialtyId - Specialty ID
 * @returns {array} Array of populated doctors
 */
export const getDoctorsBySpecialty = (specialtyId) => {
  return sampleDoctors
    .filter((d) => d.specialty_id.includes(specialtyId))
    .map((d) => getPopulatedDoctor(d._id));
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  sampleAccounts,
  sampleUsers,
  sampleSpecialties,
  sampleClinics,
  sampleDoctors,
  sampleAssistants,
  getPopulatedDoctor,
  getPopulatedAssistant,
  getDoctorsByClinic,
  getAssistantsByDoctor,
  getAssistantsByClinic,
  getDoctorsBySpecialty,
};