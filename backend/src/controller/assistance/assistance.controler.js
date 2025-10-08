
/* ========================= PATIENTS ========================= */
// GET /patients
exports.viewListPatients = async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ service, bao gồm cả 'patients' và 'pagination'
        // Truyền req.query vào để service có thể lấy page và limit (ví dụ: /patients?page=1&limit=10)

        const { patients, pagination } = await doctorService.getListPatients(req);

        // 2. Dùng .map() để tạo một mảng mới với định dạng mong muốn
        const formattedPatients = patients.map(patient => formatDataUtils.formatData(patient)) || [];

        // 3. Trả về response thành công với dữ liệu đã được định dạng
        return resUtils.paginatedResponse(
            res,
            { patients: formattedPatients },
            pagination,
            "Lấy danh sách bệnh nhân thành công."
        );
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error("Error in viewListPatients:", error);
        return resUtils.errorResponse(res, error.message || "Có lỗi xảy ra", 500);
    }
};

// GET /patients/:patientId
exports.viewPatientById = async (req, res) => {
    try {
        const { patient } = await patientService.getPatientById(req);

        return resUtils.successResponse(
            res,
            {
                patients: formatDataUtils.formatData(patient) || null,
            },
            "Lấy thông tin bệnh nhân thành công."
        );
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error("Error in viewListPatients:", error);
        return resUtils.errorResponse(res, error.message || "Có lỗi xảy ra", 500);
    }
};

// GET /patients/code/:patientCode
exports.viewPatientByCode = async (req, res) => {
    try {
        const { patient } = await patientService.getPatientByCode(req);

        return resUtils.successResponse(
            res,
            {
                patient: formatDataUtils.formatData(patient) || null,
            },
            "Lấy thông tin bệnh nhân thành công."
        );
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error("Error in viewListPatients:", error);
        return resUtils.errorResponse(res, error.message || "Có lỗi xảy ra", 500);
    }
};


/* ========================= APPOINTMENTS ========================= */
// GET /appointments
exports.viewAppointments = async (req, res) => {
    res.json({ message: "View list of appointments" });
};

// GET /appointments/:appointmentId
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
