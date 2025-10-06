
/* ========================= PATIENTS ========================= */
// GET /doctor/patients
exports.viewListPatients = async (req, res) => {
    res.json({ message: "View list of patients" });
},

// GET /doctor/patients/:patientId
exports.viewPatientById = async (req, res) => {
    res.json({ message: `View patient with ID ${req.params.patientId}` });
};

// GET /doctor/patients/citizen/:citizenId
exports.viewPatientByCitizenId = async (req, res) => {
    res.json({ message: `View patient with Citizen ID ${req.params.citizenId}` });
};

/* ========================= APPOINTMENTS ========================= */
// GET /doctor/appointments
exports.viewAppointments = async (req, res) => {
    res.json({ message: "View list of appointments" });
};

// GET /doctor/appointments/:appointmentId
exports.viewAppointmentDetail = async (req, res) => {
    res.json({ message: `View appointment detail with ID ${req.params.appointmentId}` });
};

/* ========================= MEDICAL RECORD REQUESTS ========================= */
// POST /doctor/patients/:patientId/medical-records/request
exports.requestViewMedicalRecord = async (req, res) => {
    res.json({ message: `Request view medical record for patient ID ${req.params.patientId}` });
};

// GET /doctor/medical-records/requests/history
exports.viewHistoryMedicalRecordRequests = async (req, res) => {
    res.json({ message: "View history of medical record requests" });
};

/* ========================= MEDICAL RECORDS ========================= */
// GET /doctor/patients/:patientId/medical-records
exports.viewListMedicalRecords = async (req, res) => {
    res.json({ message: `View list medical records of patient ID ${req.params.patientId}` });
};

// GET /doctor/medical-records/:recordId
exports.viewMedicalRecordDetail = async (req, res) => {
    res.json({ message: `View medical record detail with ID ${req.params.recordId}` });
};

// PUT /doctor/medical-records/:recordId/verify
exports.verifyMedicalRecord = async (req, res) => {
    res.json({ message: `Verify medical record with ID ${req.params.recordId}` });
};

/* ========================= FEEDBACK ========================= */
// GET /doctor/feedback
exports.viewFeedbackList = async (req, res) => {
    res.json({ message: "View feedback list" });
};

/* ========================= ASSISTANTS ========================= */
// POST /doctor/assistants
exports.createAssistant = async (req, res) => {
    res.json({ message: "Create assistant account" });
};

// PUT /doctor/assistants/:assistantId/ban
exports.banOrUnbanAssistant = async (req, res) => {
    res.json({ message: `Ban or Unban assistant with ID ${req.params.assistantId}` });
};

// GET /doctor/assistants
exports.viewListAssistants = async (req, res) => {
    res.json({ message: "View list of assistants" });
};

/* ========================= PROFILE ========================= */
// GET /doctor/profile
exports.viewProfile = async (req, res) => {
    res.json({ message: "View doctor profile" });
};
