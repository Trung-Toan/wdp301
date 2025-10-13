// Doctor Service - API calls for doctor features
// This service layer makes it easy to switch from mock data to real API calls

import {
  mockAppointments,
  mockMedicalRecords,
  mockFeedback,
  mockAssistants,
  mockAbsences,
  mockDashboardStats,
  mockSpecialties,
  mockClinics,
  getPopulatedDoctor,
  getPopulatedPatient,
  getPopulatedAppointment,
  getTodayAppointments,
  getPendingPrescriptions,
  getPendingAccessRequests,
} from "../data/mockData";

// Toggle this to switch between mock data and real API
const USE_MOCK_DATA = true;

// Base URL for API calls (when USE_MOCK_DATA is false)
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Simulate API delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Dashboard APIs
export const getDashboardStats = async (doctorId) => {
  if (USE_MOCK_DATA) {
    await delay();

    // Calculate real-time stats from mock data
    const todayAppointments = getTodayAppointments();
    const pendingPrescriptions = getPendingPrescriptions();
    const pendingRequests = getPendingAccessRequests();

    return {
      success: true,
      data: {
        ...mockDashboardStats,
        todayPatients: todayAppointments.length,
        pendingPrescriptions: pendingPrescriptions.length,
        pendingRequests: pendingRequests.length,
      },
    };
  }

  const response = await fetch(
    `${BASE_URL}/doctor/${doctorId}/dashboard/stats`
  );
  return response.json();
};

export const getTodayAppointmentsList = async (doctorId) => {
  if (USE_MOCK_DATA) {
    await delay();
    const appointments = getTodayAppointments().filter(
      (apt) => apt.doctor._id === doctorId
    );
    return {
      success: true,
      data: appointments,
    };
  }

  const response = await fetch(
    `${BASE_URL}/doctor/${doctorId}/appointments/today`
  );
  return response.json();
};

// Patient APIs
export const getPatients = async (doctorId, filters = {}) => {
  if (USE_MOCK_DATA) {
    await delay();

    // Get all patients who have appointments with this doctor
    const doctorAppointments = mockAppointments.filter(
      (a) => a.doctor_id === doctorId
    );
    const patientIds = [
      ...new Set(doctorAppointments.map((a) => a.patient_id)),
    ];
    let patients = patientIds
      .map((id) => getPopulatedPatient(id))
      .filter(Boolean);

    // Apply filters
    if (filters.search) {
      patients = patients.filter((p) =>
        p.user.full_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return {
      success: true,
      data: patients,
      total: patients.length,
    };
  }

  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(
    `${BASE_URL}/doctor/${doctorId}/patients?${queryParams}`
  );
  return response.json();
};

export const getPatientById = async (patientId) => {
  if (USE_MOCK_DATA) {
    await delay();
    const patient = getPopulatedPatient(patientId);
    return {
      success: true,
      data: patient,
    };
  }

  const response = await fetch(`${BASE_URL}/patients/${patientId}`);
  return response.json();
};

// Appointment APIs
export const getAppointments = async (doctorId, filters = {}) => {
  if (USE_MOCK_DATA) {
    await delay();

    console.log("[v0] Fetching appointments for doctor:", doctorId);
    console.log("[v0] Filters:", filters);

    let appointments = mockAppointments
      .filter((a) => a.doctor_id === doctorId)
      .map((a) => getPopulatedAppointment(a._id))
      .filter(Boolean); // Remove any null values

    console.log("[v0] Found appointments:", appointments.length);

    // Apply filters
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);

      appointments = appointments.filter((a) => {
        if (!a.slot) return false;
        const slotDate = new Date(a.slot.start_time);
        slotDate.setHours(0, 0, 0, 0);
        return slotDate.getTime() === filterDate.getTime();
      });

      console.log("[v0] After date filter:", appointments.length);
    }

    if (filters.status) {
      appointments = appointments.filter((a) => a.status === filters.status);
      console.log("[v0] After status filter:", appointments.length);
    }

    return {
      success: true,
      data: appointments,
      total: appointments.length,
    };
  }

  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(
    `${BASE_URL}/doctor/${doctorId}/appointments?${queryParams}`
  );
  return response.json();
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      message: "Cập nhật trạng thái thành công",
    };
  }

  const response = await fetch(
    `${BASE_URL}/appointments/${appointmentId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );
  return response.json();
};

// Medical Record APIs
export const getAllMedicalRecordsByDoctor = async (doctorId) => {
  if (USE_MOCK_DATA) {
    await delay()
    const records = mockMedicalRecords
      .filter((r) => r.doctor_id === doctorId)
      .map((record) => ({
        ...record,
        patient: getPopulatedPatient(record.patient_id),
        doctor: getPopulatedDoctor(record.doctor_id),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    console.log("[v0] getAllMedicalRecordsByDoctor - Found records:", records.length)

    return {
      success: true,
      data: records,
      total: records.length,
    }
  }

  const response = await fetch(`${BASE_URL}/doctor/${doctorId}/medical-records`)
  return response.json()
}

export const getMedicalRecordsByPatient = async (patientId) => {
  if (USE_MOCK_DATA) {
    await delay()
    const records = mockMedicalRecords
      .filter((r) => r.patient_id === patientId)
      .map((record) => ({
        ...record,
        patient: getPopulatedPatient(record.patient_id),
        doctor: getPopulatedDoctor(record.doctor_id),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    console.log("[v0] getMedicalRecordsByPatient - Found records:", records.length)

    return {
      success: true,
      data: records,
      total: records.length,
    }
  }

  const response = await fetch(`${BASE_URL}/patients/${patientId}/medical-records`)
  return response.json()
}

export const getMedicalRecordById = async (recordId) => {
  if (USE_MOCK_DATA) {
    await delay()
    const record = mockMedicalRecords.find((r) => r._id === recordId)
    if (!record) {
      return { success: false, message: "Không tìm thấy bệnh án" }
    }

    return {
      success: true,
      data: {
        ...record,
        patient: getPopulatedPatient(record.patient_id),
        doctor: getPopulatedDoctor(record.doctor_id),
      },
    }
  }

  const response = await fetch(`${BASE_URL}/medical-records/${recordId}`)
  return response.json()
}

export const createMedicalRecord = async (recordData) => {
  if (USE_MOCK_DATA) {
    await delay()
    const newRecord = {
      _id: "MR" + Date.now(),
      ...recordData,
      status: recordData.status || "PRIVATE",
      access_requests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("[v0] createMedicalRecord - Created:", newRecord._id)

    return {
      success: true,
      message: "Tạo hồ sơ bệnh án thành công",
      data: {
        ...newRecord,
        patient: getPopulatedPatient(newRecord.patient_id),
        doctor: getPopulatedDoctor(newRecord.doctor_id),
      },
    }
  }

  const response = await fetch(`${BASE_URL}/medical-records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recordData),
  })
  return response.json()
}

export const updateMedicalRecord = async (recordId, recordData) => {
  if (USE_MOCK_DATA) {
    await delay()
    const record = mockMedicalRecords.find((r) => r._id === recordId)
    if (!record) {
      return { success: false, message: "Không tìm thấy bệnh án" }
    }

    // Check if prescription is verified - if yes, cannot update
    if (record.prescription?.verified_at) {
      return {
        success: false,
        message: "Không thể chỉnh sửa bệnh án đã được duyệt đơn thuốc",
      }
    }

    console.log("[v0] updateMedicalRecord - Updated:", recordId)

    return {
      success: true,
      message: "Cập nhật hồ sơ bệnh án thành công",
      data: {
        ...record,
        ...recordData,
        updatedAt: new Date(),
        patient: getPopulatedPatient(record.patient_id),
        doctor: getPopulatedDoctor(record.doctor_id),
      },
    }
  }

  const response = await fetch(`${BASE_URL}/medical-records/${recordId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recordData),
  })
  return response.json()
}

export const deleteMedicalRecord = async (recordId) => {
  if (USE_MOCK_DATA) {
    await delay()
    const record = mockMedicalRecords.find((r) => r._id === recordId)
    if (!record) {
      return { success: false, message: "Không tìm thấy bệnh án" }
    }

    // Check if prescription is verified - if yes, cannot delete
    if (record.prescription?.verified_at) {
      return {
        success: false,
        message: "Không thể xóa bệnh án đã được duyệt đơn thuốc",
      }
    }

    console.log("[v0] deleteMedicalRecord - Deleted:", recordId)

    return {
      success: true,
      message: "Xóa hồ sơ bệnh án thành công",
    }
  }

  const response = await fetch(`${BASE_URL}/medical-records/${recordId}`, {
    method: "DELETE",
  })
  return response.json()
}

// Prescription APIs
export const getPrescriptions = async (doctorId, filters = {}) => {
  if (USE_MOCK_DATA) {
    await delay();
    let records = mockMedicalRecords.filter(
      (r) => r.doctor_id === doctorId && r.prescription
    );

    if (filters.status === "pending") {
      records = records.filter((r) => !r.prescription.verified_at);
    } else if (filters.status === "verified") {
      records = records.filter((r) => r.prescription.verified_at);
    }

    const prescriptions = records.map((record) => ({
      _id: record._id,
      ...record.prescription,
      medical_record_id: record._id,
      patient: getPopulatedPatient(record.patient_id),
      doctor: getPopulatedDoctor(record.doctor_id),
      status: record.prescription.verified_at ? "verified" : "pending",
    }));

    return {
      success: true,
      data: prescriptions,
      total: prescriptions.length,
    };
  }

  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(
    `${BASE_URL}/doctor/${doctorId}/prescriptions?${queryParams}`
  );
  return response.json();
};

export const verifyPrescription = async (medicalRecordId, doctorId) => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      message: "Đơn thuốc đã được duyệt thành công",
    };
  }

  const response = await fetch(
    `${BASE_URL}/medical-records/${medicalRecordId}/prescription/verify`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctor_id: doctorId }),
    }
  );
  return response.json();
};

export const rejectPrescription = async (medicalRecordId, reason) => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      message: "Đơn thuốc đã bị từ chối",
    };
  }

  const response = await fetch(
    `${BASE_URL}/medical-records/${medicalRecordId}/prescription/reject`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }
  );
  return response.json();
};

// Medical Record Access Request APIs
export const getMedicalRecordRequests = async (doctorId, filters = {}) => {
  if (USE_MOCK_DATA) {
    await delay();
    let requests = getPendingAccessRequests();

    if (filters.status) {
      requests = requests.filter((r) => r.status === filters.status);
    }

    return {
      success: true,
      data: requests,
      total: requests.length,
    };
  }

  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(
    `${BASE_URL}/doctor/${doctorId}/access-requests?${queryParams}`
  );
  return response.json();
};

export const requestMedicalRecordAccess = async (
  doctorId,
  patientId,
  medicalRecordId
) => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      message: "Đã gửi yêu cầu xem bệnh án",
    };
  }

  const response = await fetch(
    `${BASE_URL}/medical-records/${medicalRecordId}/access-request`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctor_id: doctorId }),
    }
  );
  return response.json();
};

export const respondToAccessRequest = async (
  medicalRecordId,
  doctorId,
  response,
  notes
) => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      message: `Yêu cầu đã được ${
        response === "APPROVED" ? "chấp nhận" : "từ chối"
      }`,
    };
  }

  const res = await fetch(
    `${BASE_URL}/medical-records/${medicalRecordId}/access-request/${doctorId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: response, notes }),
    }
  );
  return res.json();
};

// Feedback APIs
export const getFeedback = async (doctorId, filters = {}) => {
  if (USE_MOCK_DATA) {
    await delay();
    let feedback = mockFeedback.filter((f) => f.doctor_id === doctorId);

    if (filters.rating) {
      feedback = feedback.filter(
        (f) => f.rating === Number.parseInt(filters.rating)
      );
    }

    // Populate with patient info (but keep anonymous if needed)
    feedback = feedback.map((f) => ({
      ...f,
      patient: f.is_anonymous ? null : getPopulatedPatient(f.patient_id),
    }));

    return {
      success: true,
      data: feedback,
      total: feedback.length,
    };
  }

  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(
    `${BASE_URL}/doctor/${doctorId}/feedback?${queryParams}`
  );
  return response.json();
};

// Assistant APIs
export const getAssistants = async (doctorId) => {
  if (USE_MOCK_DATA) {
    await delay();
    const assistants = mockAssistants.filter((a) => a.doctor_id === doctorId);
    return {
      success: true,
      data: assistants,
    };
  }

  const response = await fetch(`${BASE_URL}/doctor/${doctorId}/assistants`);
  return response.json();
};

export const createAssistant = async (assistantData) => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      message: "Tạo tài khoản trợ lý thành công",
      data: { _id: "AST" + Date.now(), ...assistantData, status: "active" },
    };
  }

  const response = await fetch(`${BASE_URL}/assistants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assistantData),
  });
  return response.json();
};

export const updateAssistant = async (assistantId, assistantData) => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      message: "Cập nhật thông tin trợ lý thành công",
    };
  }

  const response = await fetch(`${BASE_URL}/assistants/${assistantId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assistantData),
  });
  return response.json();
};

export const deleteAssistant = async (assistantId) => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      message: "Xóa tài khoản trợ lý thành công",
    };
  }

  const response = await fetch(`${BASE_URL}/assistants/${assistantId}`, {
    method: "DELETE",
  });
  return response.json();
};

// Absence APIs
export const getAbsences = async (doctorId) => {
  if (USE_MOCK_DATA) {
    await delay();
    const absences = mockAbsences.filter((a) => a.doctor_id === doctorId);
    return {
      success: true,
      data: absences,
    };
  }

  const response = await fetch(`${BASE_URL}/doctor/${doctorId}/absences`);
  return response.json();
};

export const createAbsence = async (absenceData) => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      message: "Đã gửi thông báo nghỉ việc",
      data: {
        _id: "ABS" + Date.now(),
        ...absenceData,
        status: "pending",
        created_at: new Date(),
      },
    };
  }

  const response = await fetch(`${BASE_URL}/absences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(absenceData),
  });
  return response.json();
};

export const deleteAbsence = async (absenceId) => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      message: "Đã hủy thông báo nghỉ việc",
    };
  }

  const response = await fetch(`${BASE_URL}/absences/${absenceId}`, {
    method: "DELETE",
  });
  return response.json();
};

// Doctor Registration API
export const registerDoctor = async (doctorData) => {
  if (USE_MOCK_DATA) {
    await delay(1000);
    return {
      success: true,
      message: "Đăng ký thành công! Vui lòng chờ phê duyệt.",
      data: {
        _id: "DOC" + Date.now(),
        ...doctorData,
        rating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  const response = await fetch(`${BASE_URL}/doctors/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doctorData),
  });
  return response.json();
};

// Specialty APIs
export const getSpecialties = async () => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      data: mockSpecialties.filter((s) => s.status === "ACTIVE"),
    };
  }

  const response = await fetch(`${BASE_URL}/specialties`);
  return response.json();
};

// Clinic APIs
export const getClinics = async () => {
  if (USE_MOCK_DATA) {
    await delay();
    return {
      success: true,
      data: mockClinics.filter((c) => c.status === "ACTIVE"),
    };
  }

  const response = await fetch(`${BASE_URL}/clinics`);
  return response.json();
};
