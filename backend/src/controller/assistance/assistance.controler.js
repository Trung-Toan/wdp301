
/* ========================= PATIENTS ========================= */
// GET /doctor/patients
exports.viewListPatients = async (req, res) => {
    res.json({ message: "View list of patients" });
};

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

// PUT /appointments/:appointmentId/verify
exports.verifyAppointment = async (req, res) => {
    res.json({ message: `verify appointment ${req.params.appointmentId}` });
};

/* ========================= Slot ========================= */
// POST /appointments/:appointmentId/slots
exports.createAppointmentSlot = async (req, res) => {
    res.json({ message: `Create slot for appointment ID ${req.params.appointmentId}` });
};

// PUT /appointments/:appointmentId/slots
exports.updateAppointmentSlot = async (req, res) => {
    res.json({ message: `Update slot for appointment ID ${req.params.appointmentId}` });
};


/* ========================= MEDICAL RECORDS ========================= */
// GET /patients/:patientId/medical-records
exports.viewListMedicalRecords = async (req, res) => {
    res.json({ message: `View list medical records of patient ID ${req.params.patientId}` });
};

// GET /medical-records/:recordId
exports.viewMedicalRecordDetail = async (req, res) => {
    res.json({ message: `View medical record detail with ID ${req.params.recordId}` });
};

// PUT /medical-records/:recordId
exports.updateMedicalRecord = async (req, res) => {
    res.json({ message: `Update medical record with ID ${req.params.recordId}` });
};

//POST /medical-records/:recordId
exports.createMedicalRecord = async (req, res) => {
    res.json({ message: `Create medical record with ID ${req.params.recordId}` });  
};

/* ========================= PROFILE ========================= */
// GET /profile
exports.viewProfile = async (req, res) => {
    res.json({ message: "View profile" });
};
