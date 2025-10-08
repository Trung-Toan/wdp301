const doctorService = require("../../service/doctor/doctor.service");
const resUtils = require("../../utils/responseUtils");
/* ========================= PATIENTS ========================= */
// GET /doctor/patients
exports.viewListPatients = async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ service, bao gồm cả 'patients' và 'pagination'
        // Truyền req.query vào để service có thể lấy page và limit (ví dụ: /patients?page=1&limit=10)

        const { patients, pagination } = await doctorService.getListPatients(req);

        // 2. Dùng .map() để tạo một mảng mới với định dạng mong muốn
        const formattedPatients = patients.map(patient => {
            // Chuyển Mongoose document thành plain object
            const patientObject = patient.toObject();
            // Tách _id ra và lấy phần còn lại của object
            const { _id, ...rest } = patientObject;
            // Trả về object mới với 'id' và các thuộc tính còn lại
            return {
                id: _id,
                ...rest
            };
        });

        // 3. Trả về response thành công với dữ liệu đã được định dạng
        return resUtils.successResponse(
            res,
            {
                // Đưa cả danh sách bệnh nhân và thông tin phân trang vào data
                data: {
                    patients: formattedPatients,
                    pagination: pagination
                }
            },
            "Lấy danh sách bệnh nhân thành công."
        );
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error("Error in viewListPatients:", error);
        return resUtils.errorResponse(res, error.message || "Có lỗi xảy ra", 500);
    }
};

// GET /doctor/patients/:patientId
exports.viewPatientById = async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ service, bao gồm cả 'patients' và 'pagination'
        // Truyền req.query vào để service có thể lấy page và limit (ví dụ: /patients?page=1&limit=10)

        const { patients } = await doctorService.getListPatients(req);

        // 2. Dùng .map() để tạo một mảng mới với định dạng mong muốn
        const formattedPatients = patients.map(patient => {
            // Chuyển Mongoose document thành plain object
            const patientObject = patient.toObject();
            // Tách _id ra và lấy phần còn lại của object
            const { _id, ...rest } = patientObject;
            // Trả về object mới với 'id' và các thuộc tính còn lại
            return {
                id: _id,
                ...rest
            };
        });

        // 3. Trả về response thành công với dữ liệu đã được định dạng
        return resUtils.successResponse(
            res,
            {
                // Đưa cả danh sách bệnh nhân và thông tin phân trang vào data
                data: {
                    patients: formattedPatients,
                    pagination: pagination
                }
            },
            "Lấy danh sách bệnh nhân thành công."
        );
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error("Error in viewListPatients:", error);
        return resUtils.errorResponse(res, error.message || "Có lỗi xảy ra", 500);
    }
};

// GET /patients/code/:patientCode
exports.viewPatientByCode = async (req, res) => {
    res.json({ message: `View patient with code ${req.params.patientCode}` });
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
