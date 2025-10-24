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
