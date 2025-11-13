# 📋 TEST PLAN - PHẦN 2: CÁC FUNCTIONS CÒN LẠI

## 📊 TỔNG QUAN

Tài liệu này chứa test cases cho các functions còn lại chưa được bổ sung trong `TEST_PLAN_COMPLETE.md`.

**Lưu ý:** Xem `TEST_PLAN_COMPLETE.md` cho các test cases của:
- ✅ Auth Controller (10 functions)
- ✅ Appointment Controller (5 functions: create, getById, getByPatient, getAvailableSlots, checkSlotAvailability)
- ✅ Notification Controller (5 functions)

---

## 📅 APPOINTMENT CONTROLLER (Tiếp theo)

### 🧪 TEST CASES CHO FUNCTION: cancel

### Function Details
- **Function Name:** `cancel`
- **File:** `backend/src/controller/appoinment/appointment.controller.js`
- **Lines of code:** ~36 lines (149-185)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID196: Cancel Appointment Successfully (Normal Case)**

**Description:** Tests successful cancellation of appointment by patient.

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Appointment exists and belongs to patient
- Appointment status is SCHEDULED
- Appointment is not in the past

**Inputs:**
- appointmentId: Valid appointment ObjectID (from req.params.id)
- patientId: Valid patient ObjectID (from req.body)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointment: {...}, status: "CANCELLED" } }`
- Appointment status updated to CANCELLED
- Slot booking count decremented
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID197: Cancel Appointment - Unauthorized (Abnormal Case)**

**Description:** Tests canceling appointment without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- appointmentId: Valid appointment ObjectID
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Appointment not cancelled
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID198: Cancel Appointment - Appointment Not Found (Abnormal Case)**

**Description:** Tests canceling non-existent appointment.

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Appointment does not exist

**Inputs:**
- appointmentId: Non-existent appointment ObjectID
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "Appointment not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID199: Cancel Appointment - Patient Does Not Own Appointment (Security Test)**

**Description:** Tests canceling appointment when patient does not own the appointment.

**Preconditions:**
- Can connect with server
- Patient A is authenticated
- Appointment exists but belongs to Patient B

**Inputs:**
- appointmentId: Valid appointment ObjectID (belongs to Patient B)
- patientId: Patient A ObjectID

**Expected Outcome:**
- Return: `403 Forbidden`
- Response: `{ success: false, error: "do not have permission" }`
- System should prevent cancellation of other patients' appointments
- Exception: (None)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID200: Cancel Appointment - Missing Appointment ID (Abnormal Case)**

**Description:** Tests canceling appointment when appointment ID is missing.

**Preconditions:**
- Can connect with server
- Patient is authenticated

**Inputs:**
- appointmentId: `undefined` or `null` or `""`
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "appointmentId is required" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID201: Cancel Appointment - Missing Patient ID (Abnormal Case)**

**Description:** Tests canceling appointment when patient ID is missing.

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Appointment exists

**Inputs:**
- appointmentId: Valid appointment ObjectID
- patientId: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "patientId is required" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID202: Cancel Appointment - Invalid Appointment ID Format (Abnormal Case)**

**Description:** Tests canceling appointment with invalid appointment ID format.

**Preconditions:**
- Can connect with server
- Patient is authenticated

**Inputs:**
- appointmentId: `"invalid-id-format"` (not a valid ObjectID)
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Invalid appointmentId ObjectId." }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID203: Cancel Appointment - Invalid Patient ID Format (Abnormal Case)**

**Description:** Tests canceling appointment with invalid patient ID format.

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Appointment exists

**Inputs:**
- appointmentId: Valid appointment ObjectID
- patientId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Invalid patientId ObjectId." }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID204: Cancel Appointment - Already Cancelled (Boundary Case)**

**Description:** Tests canceling appointment that is already cancelled.

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Appointment exists and belongs to patient
- Appointment status is already CANCELLED

**Inputs:**
- appointmentId: Valid appointment ObjectID (already cancelled)
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `403 Forbidden` or `400 Bad Request` (depending on implementation)
- Response: `{ success: false, error: "Cannot cancel appointment" }` or similar
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID205: Cancel Appointment - Already Completed (Abnormal Case)**

**Description:** Tests canceling appointment that is already completed.

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Appointment exists and belongs to patient
- Appointment status is COMPLETED

**Inputs:**
- appointmentId: Valid appointment ObjectID (completed)
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `403 Forbidden`
- Response: `{ success: false, error: "Cannot cancel appointment" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID206: Cancel Appointment - Past Appointment (Abnormal Case)**

**Description:** Tests canceling appointment that is in the past.

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Appointment exists and belongs to patient
- Appointment scheduled date is in the past

**Inputs:**
- appointmentId: Valid appointment ObjectID (past appointment)
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `403 Forbidden` or `400 Bad Request` (depending on implementation)
- Response: `{ success: false, error: "Cannot cancel appointment" }` or similar
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID207: Cancel Appointment - Database Connection Error (Abnormal Case)**

**Description:** Tests canceling appointment when database connection fails.

**Preconditions:**
- Database connection unavailable
- Patient is authenticated
- Appointment exists (in disconnected database)

**Inputs:**
- appointmentId: Valid appointment ObjectID
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Internal server error" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 👨‍⚕️ DOCTOR CONTROLLER

### 🧪 TEST CASES CHO FUNCTION: viewListPatients

### Function Details
- **Function Name:** `viewListPatients`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~24 lines (13-36)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID208: View List Patients Successfully (Normal Case)**

**Description:** Tests successful retrieval of patients list for doctor.

**Preconditions:**
- Can connect with server
- Doctor is authenticated (JWT token valid)
- Doctor has patients in database

**Inputs:**
- JWT token in Authorization header (req.user.sub contains doctor account ID)
- page: (optional) `1`
- limit: (optional) `10`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: {...}, message: "Lấy danh sách bệnh nhân thành công." }`
- Patients list returned
- Pagination info included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID209: View List Patients - Unauthorized (Abnormal Case)**

**Description:** Tests viewing patients list without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID210: View List Patients - No Patients (Normal Case)**

**Description:** Tests viewing patients list when doctor has no patients.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has no patients

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [], pagination: { page: 1, limit: 10, total: 0 }, message: "Lấy danh sách bệnh nhân thành công." }`
- Empty patients list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID211: View List Patients with Pagination (Normal Case)**

**Description:** Tests viewing patients list with pagination parameters.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has more than 10 patients

**Inputs:**
- JWT token in Authorization header
- page: `2`
- limit: `5`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { page: 2, limit: 5, total: ... }, message: "Lấy danh sách bệnh nhân thành công." }`
- Only 5 patients returned (page 2)
- Pagination info correct
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID212: View List Patients - Not a Doctor (Abnormal Case)**

**Description:** Tests viewing patients list when user is not a doctor.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not DOCTOR)

**Inputs:**
- JWT token in Authorization header (patient account)

**Expected Outcome:**
- Return: `403 Forbidden` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID213: View List Patients - Database Connection Error (Abnormal Case)**

**Description:** Tests viewing patients list when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Doctor has patients (in disconnected database)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID214: View List Patients with Invalid Page Number (Boundary Case)**

**Description:** Tests viewing patients list with invalid page number.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- page: `-1` or `0`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { page: 1, ... }, message: "Lấy danh sách bệnh nhân thành công." }`
- Page defaults to 1
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID215: View List Patients with Invalid Limit (Boundary Case)**

**Description:** Tests viewing patients list with invalid limit value.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- limit: `0` or `-1`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { limit: 10, ... }, message: "Lấy danh sách bệnh nhân thành công." }`
- Limit defaults to 10
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: viewPatientById (Doctor)

### Function Details
- **Function Name:** `viewPatientById`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~25 lines (39-64)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID216: View Patient by ID Successfully (Normal Case)**

**Description:** Tests successful retrieval of patient information by ID.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Doctor has appointment with patient

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID (from req.params.patientId)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { patient: {...}, medical_record: {...} }, message: "Lấy thông tin bệnh nhân thành công." }`
- Patient details returned
- Medical record included if available
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID217: View Patient by ID - Unauthorized (Abnormal Case)**

**Description:** Tests viewing patient without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID218: View Patient by ID - Patient Not Found (Abnormal Case)**

**Description:** Tests viewing non-existent patient.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient does not exist

**Inputs:**
- JWT token in Authorization header
- patientId: Non-existent patient ObjectID

**Expected Outcome:**
- Return: `404 Not Found` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID219: View Patient by ID - Invalid ID Format (Abnormal Case)**

**Description:** Tests viewing patient with invalid ID format.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- patientId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID220: View Patient by ID - No Appointment with Patient (Normal Case)**

**Description:** Tests viewing patient when doctor has no appointment with patient.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Doctor has no appointment with this patient

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID (no appointment)

**Expected Outcome:**
- Return: `200 OK` or `404 Not Found` (depending on implementation)
- Response: Patient data or error message
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID221: View Patient by ID - Missing Patient ID (Abnormal Case)**

**Description:** Tests viewing patient when patient ID is missing.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- patientId: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID222: View Patient by ID - Not a Doctor (Abnormal Case)**

**Description:** Tests viewing patient when user is not a doctor.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not DOCTOR)

**Inputs:**
- JWT token in Authorization header (patient account)
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `403 Forbidden` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID223: View Patient by ID - Database Connection Error (Abnormal Case)**

**Description:** Tests viewing patient when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Patient exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: viewAppointments (Doctor)

### Function Details
- **Function Name:** `viewAppointments`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~25 lines (68-93)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID224: View Appointments Successfully (Normal Case)**

**Description:** Tests successful retrieval of appointments list for doctor.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor exists in database
- Doctor has appointments

**Inputs:**
- JWT token in Authorization header (req.user.sub contains doctor account ID)
- page: (optional) `1`
- limit: (optional) `10`
- status: (optional) `"SCHEDULED"` or `"COMPLETED"` or `"CANCELLED"`
- slot: (optional) Slot ID
- date: (optional) `"2024-12-25"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [...], slot: {...} }, pagination: {...}, message: "Lấy danh sách cuộc hẹn thành công." }`
- Appointments list returned
- Slot information included
- Pagination info included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID225: View Appointments - Unauthorized (Abnormal Case)**

**Description:** Tests viewing appointments without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID226: View Appointments - Doctor Not Found (Abnormal Case)**

**Description:** Tests viewing appointments when doctor does not exist.

**Preconditions:**
- Can connect with server
- User is authenticated
- Doctor record does not exist for account

**Inputs:**
- JWT token in Authorization header (account exists but no doctor record)

**Expected Outcome:**
- Return: `403 Forbidden`
- Response: `{ success: false, error: "Truy cập bị từ chối: Không tìm thấy bác sĩ." }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID227: View Appointments - No Appointments (Normal Case)**

**Description:** Tests viewing appointments when doctor has no appointments.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor exists
- Doctor has no appointments

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [], slot: null }, pagination: { page: 1, limit: 10, total: 0 }, message: "Lấy danh sách cuộc hẹn thành công." }`
- Empty appointments list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID228: View Appointments with Status Filter (Normal Case)**

**Description:** Tests viewing appointments filtered by status.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has appointments with different statuses

**Inputs:**
- JWT token in Authorization header
- status: `"SCHEDULED"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [...], slot: {...} }, pagination: {...}, message: "Lấy danh sách cuộc hẹn thành công." }`
- Only appointments with status "SCHEDULED" returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID229: View Appointments with Date Filter (Normal Case)**

**Description:** Tests viewing appointments filtered by date.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has appointments on different dates

**Inputs:**
- JWT token in Authorization header
- date: `"2024-12-25"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [...], slot: {...} }, pagination: {...}, message: "Lấy danh sách cuộc hẹn thành công." }`
- Only appointments on specified date returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID230: View Appointments with Slot Filter (Normal Case)**

**Description:** Tests viewing appointments filtered by slot.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has appointments in different slots

**Inputs:**
- JWT token in Authorization header
- slot: Valid slot ObjectID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [...], slot: {...} }, pagination: {...}, message: "Lấy danh sách cuộc hẹn thành công." }`
- Only appointments in specified slot returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID231: View Appointments with Pagination (Normal Case)**

**Description:** Tests viewing appointments with pagination parameters.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has more than 10 appointments

**Inputs:**
- JWT token in Authorization header
- page: `2`
- limit: `5`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [...], slot: {...} }, pagination: { page: 2, limit: 5, total: ... }, message: "Lấy danh sách cuộc hẹn thành công." }`
- Only 5 appointments returned (page 2)
- Pagination info correct
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID232: View Appointments - Not a Doctor (Abnormal Case)**

**Description:** Tests viewing appointments when user is not a doctor.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not DOCTOR)

**Inputs:**
- JWT token in Authorization header (patient account)

**Expected Outcome:**
- Return: `403 Forbidden`
- Response: `{ success: false, error: "Truy cập bị từ chối: Không tìm thấy bác sĩ." }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID233: View Appointments - Database Connection Error (Abnormal Case)**

**Description:** Tests viewing appointments when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Doctor has appointments (in disconnected database)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra khi lấy danh sách cuộc hẹn." }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: viewAppointmentDetail (Doctor)

### Function Details
- **Function Name:** `viewAppointmentDetail`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~20 lines (96-116)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID234: View Appointment Detail Successfully (Normal Case)**

**Description:** Tests successful retrieval of appointment detail.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Appointment exists
- Appointment belongs to doctor

**Inputs:**
- JWT token in Authorization header
- appointmentId: Valid appointment ObjectID (from req.params.appointmentId)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointment: {...} }, message: "Lấy thông tin cuộc hẹn thành công." }`
- Appointment details returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID235: View Appointment Detail - Unauthorized (Abnormal Case)**

**Description:** Tests viewing appointment detail without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- appointmentId: Valid appointment ObjectID

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID236: View Appointment Detail - Appointment Not Found (Abnormal Case)**

**Description:** Tests viewing non-existent appointment.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Appointment does not exist

**Inputs:**
- JWT token in Authorization header
- appointmentId: Non-existent appointment ObjectID

**Expected Outcome:**
- Return: `404 Not Found` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID237: View Appointment Detail - Invalid ID Format (Abnormal Case)**

**Description:** Tests viewing appointment with invalid ID format.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- appointmentId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID238: View Appointment Detail - Appointment Belongs to Different Doctor (Security Test)**

**Description:** Tests viewing appointment when appointment belongs to different doctor.

**Preconditions:**
- Can connect with server
- Doctor A is authenticated
- Appointment exists but belongs to Doctor B

**Inputs:**
- JWT token in Authorization header (Doctor A)
- appointmentId: Appointment ID belonging to Doctor B

**Expected Outcome:**
- Return: `403 Forbidden` or `404 Not Found` (depending on implementation)
- Response: Error message
- System should prevent access to other doctors' appointments
- Exception: (None)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID239: View Appointment Detail - Missing Appointment ID (Abnormal Case)**

**Description:** Tests viewing appointment when appointment ID is missing.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- appointmentId: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID240: View Appointment Detail - Not a Doctor (Abnormal Case)**

**Description:** Tests viewing appointment detail when user is not a doctor.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not DOCTOR)

**Inputs:**
- JWT token in Authorization header (patient account)
- appointmentId: Valid appointment ObjectID

**Expected Outcome:**
- Return: `403 Forbidden` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID241: View Appointment Detail - Database Connection Error (Abnormal Case)**

**Description:** Tests viewing appointment detail when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Appointment exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- appointmentId: Valid appointment ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra khi lấy thông tin cuộc hẹn." }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🏥 CLINIC CONTROLLER

### 🧪 TEST CASES CHO FUNCTION: getAllClinic

### Function Details
- **Function Name:** `getAllClinic`
- **File:** `backend/src/controller/clinic/clinic.controller.js`
- **Lines of code:** ~8 lines (3-10)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID242: Get All Clinics Successfully (Normal Case)**

**Description:** Tests successful retrieval of all clinics.

**Preconditions:**
- Can connect with server
- Clinics exist in database

**Inputs:**
- Query parameters: (optional) filters from req.query

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, total: X, data: [...] }`
- All clinics list returned
- Total count included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID243: Get All Clinics - No Clinics (Normal Case)**

**Description:** Tests getting all clinics when no clinics exist.

**Preconditions:**
- Can connect with server
- No clinics in database

**Inputs:**
- No query parameters

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, total: 0, data: [] }`
- Empty clinics list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID244: Get All Clinics with Filters (Normal Case)**

**Description:** Tests getting all clinics with query filters.

**Preconditions:**
- Can connect with server
- Clinics exist in database
- Some clinics match filters

**Inputs:**
- Query parameters: Filters (e.g., province_code, specialty_id)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, total: X, data: [...] }`
- Only clinics matching filters returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID245: Get All Clinics - Database Connection Error (Abnormal Case)**

**Description:** Tests getting all clinics when database connection fails.

**Preconditions:**
- Database connection unavailable
- Clinics exist (in disconnected database)

**Inputs:**
- No query parameters

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: Error message
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID246: Get All Clinics with Invalid Filters (Boundary Case)**

**Description:** Tests getting all clinics with invalid filter values.

**Preconditions:**
- Can connect with server
- Clinics exist in database

**Inputs:**
- Query parameters: Invalid filter values (e.g., invalid province_code)

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on validation)
- Response: All clinics or error message
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID247: Get All Clinics - Large Dataset (Boundary Case)**

**Description:** Tests getting all clinics when there are many clinics (1000+).

**Preconditions:**
- Can connect with server
- 1000+ clinics exist in database

**Inputs:**
- No query parameters

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, total: 1000+, data: [...] }`
- All clinics returned
- Performance acceptable
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 👤 PATIENT CONTROLLER

### 🧪 TEST CASES CHO FUNCTION: setLocation

### Function Details
- **Function Name:** `setLocation`
- **File:** `backend/src/controller/patient/patient.controller.js`
- **Lines of code:** ~23 lines (3-23)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID248: Set Location Successfully (Normal Case)**

**Description:** Tests successful setting of patient location.

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Patient exists
- Valid province_code and ward_code

**Inputs:**
- JWT token in Authorization header (req.user.sub contains account ID)
- province_code: `"01"` (valid province code)
- ward_code: `"001"` (optional, valid ward code)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { province_code: "01", ward_code: "001" } }`
- Patient location updated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID249: Set Location - Unauthorized (Abnormal Case)**

**Description:** Tests setting location without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- province_code: `"01"`
- ward_code: `"001"`

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, message: "Unauthorized" }`
- Patient location not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID250: Set Location - Missing Province Code (Abnormal Case)**

**Description:** Tests setting location when province_code is missing.

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Patient exists

**Inputs:**
- JWT token in Authorization header
- province_code: `undefined` or `null` or `""`
- ward_code: `"001"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, message: "province_code is required" }`
- Patient location not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID251: Set Location - Invalid Province Code (Abnormal Case)**

**Description:** Tests setting location with invalid province code.

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Patient exists

**Inputs:**
- JWT token in Authorization header
- province_code: `"INVALID"` (non-existent province code)
- ward_code: `"001"`

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on validation)
- Response: Success or error message
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID252: Set Location - Patient Not Found (Abnormal Case)**

**Description:** Tests setting location when patient does not exist.

**Preconditions:**
- Can connect with server
- User is authenticated
- Patient record does not exist for account

**Inputs:**
- JWT token in Authorization header (account exists but no patient record)
- province_code: `"01"`
- ward_code: `"001"`

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, message: "Patient not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID253: Set Location - User Not Found (Abnormal Case)**

**Description:** Tests setting location when user does not exist.

**Preconditions:**
- Can connect with server
- User is authenticated
- User record does not exist

**Inputs:**
- JWT token in Authorization header (account exists but no user record)
- province_code: `"01"`
- ward_code: `"001"`

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, message: "User not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID254: Set Location - Only Province Code (Normal Case)**

**Description:** Tests setting location with only province_code (ward_code is null).

**Preconditions:**
- Can connect with server
- Patient is authenticated
- Patient exists

**Inputs:**
- JWT token in Authorization header
- province_code: `"01"`
- ward_code: `null` or not provided

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { province_code: "01", ward_code: null } }`
- Patient location updated with only province_code
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID255: Set Location - Database Connection Error (Abnormal Case)**

**Description:** Tests setting location when database connection fails.

**Preconditions:**
- Database connection unavailable
- Patient is authenticated
- Patient exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- province_code: `"01"`
- ward_code: `"001"`

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, message: "Server error" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 📝 GHI CHÚ

1. **Test Execution**: Tất cả test cases cần được thực thi và cập nhật kết quả (Passed/Failed/Untested)
2. **Test Data**: Cần chuẩn bị test data phù hợp cho mỗi test case
3. **Environment**: Đảm bảo test environment được setup đúng (database, dependencies, etc.)
4. **Coverage**: Mục tiêu đạt 80%+ code coverage cho các functions quan trọng
5. **Automation**: Nên tự động hóa các test cases để chạy trong CI/CD pipeline

## 🔄 CẬP NHẬT

- **Version**: 1.0
- **Last Updated**: (Date)
- **Next Review**: (Date)

---

## 🧪 TEST CASES CHO FUNCTION: getClinicDetail

### Function Details
- **Function Name:** `getClinicDetail`
- **File:** `backend/src/controller/clinic/clinicDetail.controller.js`
- **Lines of code:** ~9 lines (4-13)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID256: Get Clinic Detail Successfully (Normal Case)**

**Description:** Tests successful retrieval of clinic detail.

**Preconditions:**
- Can connect with server
- Clinic exists in database

**Inputs:**
- clinicId: Valid clinic ObjectID (from req.params.clinicId)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { clinic: {...} } }`
- Clinic details returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID257: Get Clinic Detail - Clinic Not Found (Abnormal Case)**

**Description:** Tests getting clinic detail for non-existent clinic.

**Preconditions:**
- Can connect with server
- Clinic does not exist

**Inputs:**
- clinicId: Non-existent clinic ObjectID

**Expected Outcome:**
- Return: `404 Not Found` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID258: Get Clinic Detail - Invalid ID Format (Abnormal Case)**

**Description:** Tests getting clinic detail with invalid ID format.

**Preconditions:**
- Can connect with server

**Inputs:**
- clinicId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID259: Get Clinic Detail - Missing Clinic ID (Abnormal Case)**

**Description:** Tests getting clinic detail when clinic ID is missing.

**Preconditions:**
- Can connect with server

**Inputs:**
- clinicId: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID260: Get Clinic Detail - Inactive Clinic (Boundary Case)**

**Description:** Tests getting clinic detail for inactive clinic.

**Preconditions:**
- Can connect with server
- Clinic exists but is inactive

**Inputs:**
- clinicId: Valid clinic ObjectID (inactive clinic)

**Expected Outcome:**
- Return: `200 OK` or `404 Not Found` (depending on implementation)
- Response: Clinic data or error message
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID261: Get Clinic Detail - Database Connection Error (Abnormal Case)**

**Description:** Tests getting clinic detail when database connection fails.

**Preconditions:**
- Database connection unavailable
- Clinic exists (in disconnected database)

**Inputs:**
- clinicId: Valid clinic ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: Error message
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: getClinicDoctors

### Function Details
- **Function Name:** `getClinicDoctors`
- **File:** `backend/src/controller/clinic/clinicDetail.controller.js`
- **Lines of code:** ~15 lines (16-31)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID262: Get Clinic Doctors Successfully (Normal Case)**

**Description:** Tests successful retrieval of doctors for clinic.

**Preconditions:**
- Can connect with server
- Clinic exists
- Clinic has doctors

**Inputs:**
- clinicId: Valid clinic ObjectID
- specialtyId: (optional) Valid specialty ObjectID
- page: (optional) `1`
- limit: (optional) `10`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: {...} }`
- Doctors list returned
- Pagination info included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID263: Get Clinic Doctors - Clinic Not Found (Abnormal Case)**

**Description:** Tests getting doctors for non-existent clinic.

**Preconditions:**
- Can connect with server
- Clinic does not exist

**Inputs:**
- clinicId: Non-existent clinic ObjectID

**Expected Outcome:**
- Return: `404 Not Found` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID264: Get Clinic Doctors - No Doctors (Normal Case)**

**Description:** Tests getting doctors when clinic has no doctors.

**Preconditions:**
- Can connect with server
- Clinic exists
- Clinic has no doctors

**Inputs:**
- clinicId: Valid clinic ObjectID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [], pagination: { page: 1, limit: 10, total: 0 } }`
- Empty doctors list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID265: Get Clinic Doctors with Specialty Filter (Normal Case)**

**Description:** Tests getting doctors filtered by specialty.

**Preconditions:**
- Can connect with server
- Clinic exists
- Clinic has doctors with different specialties

**Inputs:**
- clinicId: Valid clinic ObjectID
- specialtyId: Valid specialty ObjectID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: {...} }`
- Only doctors with specified specialty returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID266: Get Clinic Doctors with Pagination (Normal Case)**

**Description:** Tests getting doctors with pagination parameters.

**Preconditions:**
- Can connect with server
- Clinic exists
- Clinic has more than 10 doctors

**Inputs:**
- clinicId: Valid clinic ObjectID
- page: `2`
- limit: `5`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { page: 2, limit: 5, total: ... } }`
- Only 5 doctors returned (page 2)
- Pagination info correct
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID267: Get Clinic Doctors - Invalid Clinic ID Format (Abnormal Case)**

**Description:** Tests getting doctors with invalid clinic ID format.

**Preconditions:**
- Can connect with server

**Inputs:**
- clinicId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID268: Get Clinic Doctors - Invalid Specialty ID Format (Abnormal Case)**

**Description:** Tests getting doctors with invalid specialty ID format.

**Preconditions:**
- Can connect with server
- Clinic exists

**Inputs:**
- clinicId: Valid clinic ObjectID
- specialtyId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on validation)
- Response: All doctors or error message
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID269: Get Clinic Doctors - Invalid Page Number (Boundary Case)**

**Description:** Tests getting doctors with invalid page number.

**Preconditions:**
- Can connect with server
- Clinic exists

**Inputs:**
- clinicId: Valid clinic ObjectID
- page: `-1` or `0`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { page: 1, ... } }`
- Page defaults to 1
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID270: Get Clinic Doctors - Invalid Limit (Boundary Case)**

**Description:** Tests getting doctors with invalid limit value.

**Preconditions:**
- Can connect with server
- Clinic exists

**Inputs:**
- clinicId: Valid clinic ObjectID
- limit: `0` or `-1`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { limit: 10, ... } }`
- Limit defaults to 10
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID271: Get Clinic Doctors - Database Connection Error (Abnormal Case)**

**Description:** Tests getting doctors when database connection fails.

**Preconditions:**
- Database connection unavailable
- Clinic exists (in disconnected database)

**Inputs:**
- clinicId: Valid clinic ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: Error message
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: getClinicReviews

### Function Details
- **Function Name:** `getClinicReviews`
- **File:** `backend/src/controller/clinic/clinicDetail.controller.js`
- **Lines of code:** ~15 lines (34-48)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID272: Get Clinic Reviews Successfully (Normal Case)**

**Description:** Tests successful retrieval of reviews for clinic.

**Preconditions:**
- Can connect with server
- Clinic exists
- Clinic has reviews

**Inputs:**
- clinicId: Valid clinic ObjectID
- page: (optional) `1`
- limit: (optional) `10`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: {...} }`
- Reviews list returned
- Pagination info included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID273: Get Clinic Reviews - Clinic Not Found (Abnormal Case)**

**Description:** Tests getting reviews for non-existent clinic.

**Preconditions:**
- Can connect with server
- Clinic does not exist

**Inputs:**
- clinicId: Non-existent clinic ObjectID

**Expected Outcome:**
- Return: `404 Not Found` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID274: Get Clinic Reviews - No Reviews (Normal Case)**

**Description:** Tests getting reviews when clinic has no reviews.

**Preconditions:**
- Can connect with server
- Clinic exists
- Clinic has no reviews

**Inputs:**
- clinicId: Valid clinic ObjectID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [], pagination: { page: 1, limit: 10, total: 0 } }`
- Empty reviews list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID275: Get Clinic Reviews with Pagination (Normal Case)**

**Description:** Tests getting reviews with pagination parameters.

**Preconditions:**
- Can connect with server
- Clinic exists
- Clinic has more than 10 reviews

**Inputs:**
- clinicId: Valid clinic ObjectID
- page: `2`
- limit: `5`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { page: 2, limit: 5, total: ... } }`
- Only 5 reviews returned (page 2)
- Pagination info correct
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID276: Get Clinic Reviews - Invalid Clinic ID Format (Abnormal Case)**

**Description:** Tests getting reviews with invalid clinic ID format.

**Preconditions:**
- Can connect with server

**Inputs:**
- clinicId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID277: Get Clinic Reviews - Invalid Page Number (Boundary Case)**

**Description:** Tests getting reviews with invalid page number.

**Preconditions:**
- Can connect with server
- Clinic exists

**Inputs:**
- clinicId: Valid clinic ObjectID
- page: `-1` or `0`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { page: 1, ... } }`
- Page defaults to 1
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID278: Get Clinic Reviews - Invalid Limit (Boundary Case)**

**Description:** Tests getting reviews with invalid limit value.

**Preconditions:**
- Can connect with server
- Clinic exists

**Inputs:**
- clinicId: Valid clinic ObjectID
- limit: `0` or `-1`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { limit: 10, ... } }`
- Limit defaults to 10
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID279: Get Clinic Reviews - Database Connection Error (Abnormal Case)**

**Description:** Tests getting reviews when database connection fails.

**Preconditions:**
- Database connection unavailable
- Clinic exists (in disconnected database)

**Inputs:**
- clinicId: Valid clinic ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: Error message
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 👤 USER/PATIENT CONTROLLER

### 🧪 TEST CASES CHO FUNCTION: getMyProfile

### Function Details
- **Function Name:** `getMyProfile`
- **File:** `backend/src/controller/user/profile.controller.js`
- **Lines of code:** ~38 lines (8-46)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID280: Get My Profile Successfully (Normal Case)**

**Description:** Tests successful retrieval of user's own profile.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists
- User has patient record

**Inputs:**
- JWT token in Authorization header (req.user.sub contains account ID)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { id, full_name, dob, gender, address, avatar_url, account, notify_upcoming, notify_results, notify_marketing, privacy_allow_doctor_view, privacy_share_with_providers, province_code, ward_code, blood_type, allergies, chronic_diseases, medications, surgery_history } }`
- Complete profile data returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID281: Get My Profile - Unauthorized (Abnormal Case)**

**Description:** Tests getting profile without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID282: Get My Profile - User Not Found (Abnormal Case)**

**Description:** Tests getting profile when user does not exist.

**Preconditions:**
- Can connect with server
- User is authenticated
- User record does not exist for account

**Inputs:**
- JWT token in Authorization header (account exists but no user record)

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "User not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID283: Get My Profile - No Patient Record (Normal Case)**

**Description:** Tests getting profile when user has no patient record.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists
- User has no patient record

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { ..., province_code: null, ward_code: null, blood_type: null, allergies: [], chronic_diseases: [], medications: [], surgery_history: [] } }`
- Profile returned with null/empty patient fields
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID284: Get My Profile - Database Connection Error (Abnormal Case)**

**Description:** Tests getting profile when database connection fails.

**Preconditions:**
- Database connection unavailable
- User is authenticated
- User exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Internal server error" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID285: Get My Profile - Missing Account ID in Token (Abnormal Case)**

**Description:** Tests getting profile when JWT token has no account ID.

**Preconditions:**
- Can connect with server
- User is authenticated
- JWT token exists but req.user.sub is missing

**Inputs:**
- JWT token in Authorization header (but req.user.sub is undefined)

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: updateMyProfile

### Function Details
- **Function Name:** `updateMyProfile`
- **File:** `backend/src/controller/user/profile.controller.js`
- **Lines of code:** ~98 lines (48-146)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 12
- **Passed:** 0
- **Failed:** 0
- **Untested:** 12
- **N/A/B:** 0

---

### **UTCID286: Update My Profile Successfully (Normal Case)**

**Description:** Tests successful update of user's profile.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists

**Inputs:**
- JWT token in Authorization header
- full_name: `"Nguyen Van A"`
- dob: `"1990-01-01"`
- gender: `"MALE"`
- address: `"123 Main Street"`
- avatar_url: (optional) `"https://example.com/avatar.jpg"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { updated user profile } }`
- User profile updated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID287: Update My Profile - Unauthorized (Abnormal Case)**

**Description:** Tests updating profile without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- full_name: `"Nguyen Van A"`

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Profile not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID288: Update My Profile - User Not Found (Abnormal Case)**

**Description:** Tests updating profile when user does not exist.

**Preconditions:**
- Can connect with server
- User is authenticated
- User record does not exist for account

**Inputs:**
- JWT token in Authorization header (account exists but no user record)
- full_name: `"Nguyen Van A"`

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "User not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID289: Update My Profile - Partial Update (Normal Case)**

**Description:** Tests updating only some fields of profile.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists

**Inputs:**
- JWT token in Authorization header
- full_name: `"Nguyen Van B"` (only this field updated)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { updated user profile } }`
- Only full_name updated
- Other fields remain unchanged
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID290: Update My Profile - Invalid DOB Format (Abnormal Case)**

**Description:** Tests updating profile with invalid date of birth format.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists

**Inputs:**
- JWT token in Authorization header
- dob: `"invalid-date-format"`

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on validation)
- Response: Success or error message
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID291: Update My Profile - Invalid Gender Value (Abnormal Case)**

**Description:** Tests updating profile with invalid gender value.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists

**Inputs:**
- JWT token in Authorization header
- gender: `"INVALID_GENDER"`

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on validation)
- Response: Success or error message
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID292: Update My Profile - Very Long Full Name (Boundary Case)**

**Description:** Tests updating profile with extremely long full name.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists

**Inputs:**
- JWT token in Authorization header
- full_name: `"A".repeat(1000)` (very long string)

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on validation)
- Response: Success or error message
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID293: Update My Profile - Empty Full Name (Boundary Case)**

**Description:** Tests updating profile with empty full name.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists

**Inputs:**
- JWT token in Authorization header
- full_name: `""`

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on validation)
- Response: Success or error message
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID294: Update My Profile - Invalid Avatar URL (Abnormal Case)**

**Description:** Tests updating profile with invalid avatar URL format.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists

**Inputs:**
- JWT token in Authorization header
- avatar_url: `"not-a-valid-url"`

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on validation)
- Response: Success or error message
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID295: Update My Profile - Database Connection Error (Abnormal Case)**

**Description:** Tests updating profile when database connection fails.

**Preconditions:**
- Database connection unavailable
- User is authenticated
- User exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- full_name: `"Nguyen Van A"`

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Internal server error" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID296: Update My Profile - SQL Injection Attempt (Security Test)**

**Description:** Tests updating profile with SQL injection attempt.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists

**Inputs:**
- JWT token in Authorization header
- full_name: `"Test'; DROP TABLE users; --"`

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (should be sanitized)
- Response: Should handle safely without executing SQL
- Exception: (None, should be handled safely)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID297: Update My Profile - XSS Attempt (Security Test)**

**Description:** Tests updating profile with XSS attempt.

**Preconditions:**
- Can connect with server
- User is authenticated
- User exists

**Inputs:**
- JWT token in Authorization header
- full_name: `"<script>alert('XSS')</script>"`

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (should be sanitized)
- Response: Should handle safely without executing script
- Exception: (None, should be handled safely)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🏥 ADMIN CLINIC CONTROLLER

### 🧪 TEST CASES CHO FUNCTION: createAccountDoctor

### Function Details
- **Function Name:** `createAccountDoctor`
- **File:** `backend/src/controller/admin_clinic/admin_clinic.controller.js`
- **Lines of code:** ~17 lines (18-29)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID298: Create Doctor Account Successfully (Normal Case)**

**Description:** Tests successful creation of doctor account by admin clinic.

**Preconditions:**
- Can connect with server
- Admin clinic is authenticated
- Admin clinic has clinic
- Email does not exist in database
- Username does not exist in database

**Inputs:**
- JWT token in Authorization header (req.user.sub contains admin clinic account ID)
- email: `"doctor@example.com"`
- username: `"doctor123"`
- password: `"ValidPass123!@#"`
- phone_number: `"0123456789"`
- full_name: `"Dr. Nguyen Van A"`
- clinic_id: (optional) Valid clinic ObjectID (belongs to admin)

**Expected Outcome:**
- Return: `200 OK` or `201 Created`
- Response: `{ ok: true, data: { account, user, doctor } }`
- Doctor account created
- Doctor linked to clinic
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID299: Create Doctor Account - Unauthorized (Abnormal Case)**

**Description:** Tests creating doctor account without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- email: `"doctor@example.com"`
- username: `"doctor123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ ok: false, message: "Unauthorized" }`
- Doctor account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID300: Create Doctor Account - Not Admin Clinic (Abnormal Case)**

**Description:** Tests creating doctor account when user is not admin clinic.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not ADMIN_CLINIC)

**Inputs:**
- JWT token in Authorization header (patient account)
- email: `"doctor@example.com"`
- username: `"doctor123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `403 Forbidden` or `400 Bad Request` (depending on implementation)
- Response: Error message
- Doctor account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID301: Create Doctor Account - Missing Required Fields (Abnormal Case)**

**Description:** Tests creating doctor account when required fields are missing.

**Preconditions:**
- Can connect with server
- Admin clinic is authenticated
- Admin clinic has clinic

**Inputs:**
- JWT token in Authorization header
- email: `undefined` or `null` or `""`
- username: `"doctor123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Missing required fields" }`
- Doctor account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID302: Create Doctor Account - Duplicate Email (Abnormal Case)**

**Description:** Tests creating doctor account with duplicate email.

**Preconditions:**
- Can connect with server
- Admin clinic is authenticated
- Admin clinic has clinic
- Email already exists in database

**Inputs:**
- JWT token in Authorization header
- email: `"existing@example.com"` (already exists)
- username: `"doctor123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Email already exists" }`
- Doctor account not created
- Exception: Database duplicate key error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID303: Create Doctor Account - Duplicate Username (Abnormal Case)**

**Description:** Tests creating doctor account with duplicate username.

**Preconditions:**
- Can connect with server
- Admin clinic is authenticated
- Admin clinic has clinic
- Username already exists in database

**Inputs:**
- JWT token in Authorization header
- email: `"doctor@example.com"`
- username: `"existinguser"` (already exists)
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Username already exists" }`
- Doctor account not created
- Exception: Database duplicate key error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID304: Create Doctor Account - Clinic Not Belongs to Admin (Security Test)**

**Description:** Tests creating doctor account with clinic that doesn't belong to admin.

**Preconditions:**
- Can connect with server
- Admin clinic A is authenticated
- Admin clinic B has clinic
- Clinic belongs to Admin B

**Inputs:**
- JWT token in Authorization header (Admin A)
- email: `"doctor@example.com"`
- username: `"doctor123"`
- password: `"ValidPass123!@#"`
- clinic_id: Clinic ID belonging to Admin B

**Expected Outcome:**
- Return: `403 Forbidden`
- Response: `{ ok: false, message: "Phòng khám không thuộc quyền quản lý của bạn" }`
- System should prevent creating doctor for other admin's clinic
- Doctor account not created
- Exception: (None)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID305: Create Doctor Account - Invalid Email Format (Abnormal Case)**

**Description:** Tests creating doctor account with invalid email format.

**Preconditions:**
- Can connect with server
- Admin clinic is authenticated
- Admin clinic has clinic

**Inputs:**
- JWT token in Authorization header
- email: `"invalid-email-format"`
- username: `"doctor123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Invalid email format" }`
- Doctor account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID306: Create Doctor Account - Weak Password (Abnormal Case)**

**Description:** Tests creating doctor account with weak password.

**Preconditions:**
- Can connect with server
- Admin clinic is authenticated
- Admin clinic has clinic

**Inputs:**
- JWT token in Authorization header
- email: `"doctor@example.com"`
- username: `"doctor123"`
- password: `"weak"` (too short, no uppercase/special)

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Password does not meet requirements" }`
- Doctor account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID307: Create Doctor Account - Database Connection Error (Abnormal Case)**

**Description:** Tests creating doctor account when database connection fails.

**Preconditions:**
- Database connection unavailable
- Admin clinic is authenticated
- Admin clinic has clinic (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- email: `"doctor@example.com"`
- username: `"doctor123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ ok: false, message: "Internal server error" }`
- Doctor account not created
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: getClinicByAdmin

### Function Details
- **Function Name:** `getClinicByAdmin`
- **File:** `backend/src/controller/admin_clinic/admin_clinic.controller.js`
- **Lines of code:** ~9 lines (32-40)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID308: Get Clinic by Admin Successfully (Normal Case)**

**Description:** Tests successful retrieval of clinic for admin clinic.

**Preconditions:**
- Can connect with server
- Admin clinic is authenticated
- Admin clinic has clinic

**Inputs:**
- JWT token in Authorization header (req.user.sub contains admin clinic account ID)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, data: { clinic: {...} } }`
- Clinic details returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID309: Get Clinic by Admin - Unauthorized (Abnormal Case)**

**Description:** Tests getting clinic without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ ok: false, message: "Unauthorized" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID310: Get Clinic by Admin - Not Admin Clinic (Abnormal Case)**

**Description:** Tests getting clinic when user is not admin clinic.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not ADMIN_CLINIC)

**Inputs:**
- JWT token in Authorization header (patient account)

**Expected Outcome:**
- Return: `403 Forbidden` or `400 Bad Request` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID311: Get Clinic by Admin - No Clinic (Normal Case)**

**Description:** Tests getting clinic when admin clinic has no clinic.

**Preconditions:**
- Can connect with server
- Admin clinic is authenticated
- Admin clinic has no clinic

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `400 Bad Request` or `404 Not Found` (depending on implementation)
- Response: `{ ok: false, message: "No clinic found" }` or similar
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID312: Get Clinic by Admin - Database Connection Error (Abnormal Case)**

**Description:** Tests getting clinic when database connection fails.

**Preconditions:**
- Database connection unavailable
- Admin clinic is authenticated
- Admin clinic has clinic (in disconnected database)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ ok: false, message: "Internal server error" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID313: Get Clinic by Admin - Multiple Clinics (Boundary Case)**

**Description:** Tests getting clinic when admin clinic has multiple clinics.

**Preconditions:**
- Can connect with server
- Admin clinic is authenticated
- Admin clinic has multiple clinics

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, data: { clinic: {...} } }` (first clinic or all clinics)
- Clinic(s) returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 📝 GHI CHÚ

1. **Test Execution**: Tất cả test cases cần được thực thi và cập nhật kết quả (Passed/Failed/Untested)
2. **Test Data**: Cần chuẩn bị test data phù hợp cho mỗi test case
3. **Environment**: Đảm bảo test environment được setup đúng (database, dependencies, etc.)
4. **Coverage**: Mục tiêu đạt 80%+ code coverage cho các functions quan trọng
5. **Automation**: Nên tự động hóa các test cases để chạy trong CI/CD pipeline

## 🔄 CẬP NHẬT

- **Version**: 1.0
- **Last Updated**: (Date)
- **Next Review**: (Date)

---

## 🧪 TEST CASES CHO FUNCTION: requestViewMedicalRecord (Doctor)

### Function Details
- **Function Name:** `requestViewMedicalRecord`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~38 lines (120-157)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID314: Request View Medical Record Successfully (Normal Case)**

**Description:** Tests successful request to view patient's medical records.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Patient has medical records
- Doctor has not requested access before

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID (from req.params.patientId)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { requests: [...] }, message: "Yêu cầu xem hồ sơ bệnh án đã được gửi. Vui lòng chờ phê duyệt." }`
- Medical record requests created
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID315: Request View Medical Record - Unauthorized (Abnormal Case)**

**Description:** Tests requesting medical record access without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID316: Request View Medical Record - Patient Has No Medical Records (Normal Case)**

**Description:** Tests requesting access when patient has no medical records.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Patient has no medical records

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID (no medical records)

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, message: "Bệnh nhân này chưa có hồ sơ bệnh án." }`
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID317: Request View Medical Record - Already Requested (Abnormal Case)**

**Description:** Tests requesting access when doctor has already requested.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Patient has medical records
- Doctor has already sent request (PENDING or APPROVED)

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID (already requested)

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, message: "Bạn đã gửi yêu cầu hoặc đã được cấp quyền truy cập hồ sơ của bệnh nhân này." }`
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID318: Request View Medical Record - Patient Not Found (Abnormal Case)**

**Description:** Tests requesting access for non-existent patient.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient does not exist

**Inputs:**
- JWT token in Authorization header
- patientId: Non-existent patient ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error` or `404 Not Found` (depending on implementation)
- Response: Error message
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID319: Request View Medical Record - Invalid Patient ID Format (Abnormal Case)**

**Description:** Tests requesting access with invalid patient ID format.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- patientId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID320: Request View Medical Record - Missing Patient ID (Abnormal Case)**

**Description:** Tests requesting access when patient ID is missing.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- patientId: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID321: Request View Medical Record - Database Connection Error (Abnormal Case)**

**Description:** Tests requesting access when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Patient exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra khi gửi yêu cầu truy cập hồ sơ bệnh án." }`
- Request not created
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: requestViewMedicalRecordById (Doctor)

### Function Details
- **Function Name:** `requestViewMedicalRecordById`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~37 lines (160-196)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID322: Request View Medical Record by ID Successfully (Normal Case)**

**Description:** Tests successful request to view specific medical record by ID.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Medical record exists
- Doctor has not requested access before

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID
- medicalRecordsId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { requests: [...] }, message: "Yêu cầu xem hồ sơ bệnh án đã được gửi. Vui lòng chờ phê duyệt." }`
- Medical record request created
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID323: Request View Medical Record by ID - Unauthorized (Abnormal Case)**

**Description:** Tests requesting medical record access without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- patientId: Valid patient ObjectID
- medicalRecordsId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID324: Request View Medical Record by ID - Patient Has No Medical Records (Normal Case)**

**Description:** Tests requesting access when patient has no medical records.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Patient has no medical records

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID
- medicalRecordsId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, message: "Bệnh nhân này chưa có hồ sơ bệnh án." }`
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID325: Request View Medical Record by ID - All Records Already Requested (Abnormal Case)**

**Description:** Tests requesting access when all records have been requested.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Patient has medical records
- All records have been requested before

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID
- medicalRecordsId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, message: "Tất cả hồ sơ bệnh án của bệnh nhân này đã được gửi yêu cầu trước đó." }`
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID326: Request View Medical Record by ID - Medical Record Not Found (Abnormal Case)**

**Description:** Tests requesting access for non-existent medical record.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Medical record does not exist

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID
- medicalRecordsId: Non-existent medical record ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error` or `404 Not Found` (depending on implementation)
- Response: Error message
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID327: Request View Medical Record by ID - Invalid Medical Record ID Format (Abnormal Case)**

**Description:** Tests requesting access with invalid medical record ID format.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID
- medicalRecordsId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID328: Request View Medical Record by ID - Missing Medical Record ID (Abnormal Case)**

**Description:** Tests requesting access when medical record ID is missing.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID
- medicalRecordsId: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Request not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID329: Request View Medical Record by ID - Database Connection Error (Abnormal Case)**

**Description:** Tests requesting access when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Patient exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID
- medicalRecordsId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra khi gửi yêu cầu truy cập hồ sơ bệnh án." }`
- Request not created
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: viewHistoryMedicalRecordRequests (Doctor)

### Function Details
- **Function Name:** `viewHistoryMedicalRecordRequests`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~19 lines (199-217)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID330: View History Medical Record Requests Successfully (Normal Case)**

**Description:** Tests successful retrieval of medical record request history.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has requested medical records before

**Inputs:**
- JWT token in Authorization header
- page: (optional) `1`
- limit: (optional) `10`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { history_request: [...] }, pagination: {...}, message: "Lấy lịch sử yêu cầu xem hồ sơ bệnh án thành công." }`
- Request history returned
- Pagination info included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID331: View History Medical Record Requests - Unauthorized (Abnormal Case)**

**Description:** Tests viewing request history without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID332: View History Medical Record Requests - No History (Normal Case)**

**Description:** Tests viewing request history when doctor has no requests.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has never requested medical records

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { history_request: [] }, pagination: { page: 1, limit: 10, total: 0 }, message: "Lấy lịch sử yêu cầu xem hồ sơ bệnh án thành công." }`
- Empty history returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID333: View History Medical Record Requests with Pagination (Normal Case)**

**Description:** Tests viewing request history with pagination parameters.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has more than 10 requests

**Inputs:**
- JWT token in Authorization header
- page: `2`
- limit: `5`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { history_request: [...] }, pagination: { page: 2, limit: 5, total: ... }, message: "Lấy lịch sử yêu cầu xem hồ sơ bệnh án thành công." }`
- Only 5 requests returned (page 2)
- Pagination info correct
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID334: View History Medical Record Requests - Not a Doctor (Abnormal Case)**

**Description:** Tests viewing request history when user is not a doctor.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not DOCTOR)

**Inputs:**
- JWT token in Authorization header (patient account)

**Expected Outcome:**
- Return: `403 Forbidden` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID335: View History Medical Record Requests - Invalid Page Number (Boundary Case)**

**Description:** Tests viewing request history with invalid page number.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- page: `-1` or `0`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { history_request: [...] }, pagination: { page: 1, ... }, message: "Lấy lịch sử yêu cầu xem hồ sơ bệnh án thành công." }`
- Page defaults to 1
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID336: View History Medical Record Requests - Invalid Limit (Boundary Case)**

**Description:** Tests viewing request history with invalid limit value.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- limit: `0` or `-1`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { history_request: [...] }, pagination: { limit: 10, ... }, message: "Lấy lịch sử yêu cầu xem hồ sơ bệnh án thành công." }`
- Limit defaults to 10
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID337: View History Medical Record Requests - Database Connection Error (Abnormal Case)**

**Description:** Tests viewing request history when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Doctor has requests (in disconnected database)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra khi lấy lịch sử yêu cầu xem hồ sơ bệnh án." }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

**Lưu ý:** File này đã bổ sung test cases cho:
- ✅ Appointment Controller: cancel (12 test cases)
- ✅ Doctor Controller: viewListPatients (8), viewPatientById (8), viewAppointments (10), viewAppointmentDetail (8), requestViewMedicalRecord (8), requestViewMedicalRecordById (8), viewHistoryMedicalRecordRequests (8) - 58 test cases
- ✅ Clinic Controller: getAllClinic (6), getClinicDetail (6), getClinicDoctors (10), getClinicReviews (8) - 30 test cases
- ✅ Patient Controller: setLocation (8 test cases)
- ✅ User Controller: getMyProfile (6), updateMyProfile (12) - 18 test cases
- ✅ Admin Clinic Controller: createAccountDoctor (10), getClinicByAdmin (6) - 16 test cases

## 🧪 TEST CASES CHO FUNCTION: viewListMedicalRecords (Doctor)

### Function Details
- **Function Name:** `viewListMedicalRecords`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~18 lines (221-239)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID338: View List Medical Records Successfully (Normal Case)**

**Description:** Tests successful retrieval of medical records list.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has access to medical records

**Inputs:**
- JWT token in Authorization header
- page: (optional) `1`
- limit: (optional) `10`
- search: (optional) `"keyword"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: {...}, message: "Lấy danh sách hồ sơ bệnh án thành công." }`
- Medical records list returned
- Pagination info included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID339: View List Medical Records - Unauthorized (Abnormal Case)**

**Description:** Tests viewing medical records without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID340: View List Medical Records - No Records (Normal Case)**

**Description:** Tests viewing medical records when doctor has no access.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has no medical records access

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [], pagination: { page: 1, limit: 10, total: 0 }, message: "Lấy danh sách hồ sơ bệnh án thành công." }`
- Empty records list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID341: View List Medical Records with Search (Normal Case)**

**Description:** Tests viewing medical records with search filter.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has medical records access

**Inputs:**
- JWT token in Authorization header
- search: `"keyword"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: {...}, message: "Lấy danh sách hồ sơ bệnh án thành công." }`
- Only records matching search returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID342: View List Medical Records with Pagination (Normal Case)**

**Description:** Tests viewing medical records with pagination.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has more than 10 medical records

**Inputs:**
- JWT token in Authorization header
- page: `2`
- limit: `5`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { page: 2, limit: 5, total: ... }, message: "Lấy danh sách hồ sơ bệnh án thành công." }`
- Only 5 records returned (page 2)
- Pagination info correct
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID343: View List Medical Records - Not a Doctor (Abnormal Case)**

**Description:** Tests viewing medical records when user is not a doctor.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not DOCTOR)

**Inputs:**
- JWT token in Authorization header (patient account)

**Expected Outcome:**
- Return: `403 Forbidden` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID344: View List Medical Records - Invalid Page Number (Boundary Case)**

**Description:** Tests viewing medical records with invalid page number.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- page: `-1` or `0`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { page: 1, ... }, message: "Lấy danh sách hồ sơ bệnh án thành công." }`
- Page defaults to 1
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID345: View List Medical Records - Database Connection Error (Abnormal Case)**

**Description:** Tests viewing medical records when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Doctor has records (in disconnected database)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra khi lấy danh sách hồ sơ bệnh án." }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: viewMedicalRecordDetail (Doctor)

### Function Details
- **Function Name:** `viewMedicalRecordDetail`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~38 lines (284-322)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID346: View Medical Record Detail Successfully (Normal Case)**

**Description:** Tests successful retrieval of medical record detail.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Medical record exists
- Doctor has access to medical record

**Inputs:**
- JWT token in Authorization header
- recordId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { medicalRecord: {...} }, message: "Lấy chi tiết hồ sơ bệnh án thành công." }`
- Medical record details returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID347: View Medical Record Detail - Unauthorized (Abnormal Case)**

**Description:** Tests viewing medical record detail without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- recordId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID348: View Medical Record Detail - No Access Permission (Security Test)**

**Description:** Tests viewing medical record when doctor has no access permission.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Medical record exists
- Doctor has no access permission

**Inputs:**
- JWT token in Authorization header
- recordId: Valid medical record ObjectID (no access)

**Expected Outcome:**
- Return: `403 Forbidden`
- Response: `{ success: false, message: "Bạn không có quyền truy cập bệnh án này." }`
- System should prevent unauthorized access
- Exception: (None)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID349: View Medical Record Detail - Record Not Found (Abnormal Case)**

**Description:** Tests viewing non-existent medical record.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Medical record does not exist

**Inputs:**
- JWT token in Authorization header
- recordId: Non-existent medical record ObjectID

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, message: "Bệnh án không tồn tại." }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID350: View Medical Record Detail - Invalid Record ID Format (Abnormal Case)**

**Description:** Tests viewing medical record with invalid ID format.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- recordId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID351: View Medical Record Detail - Missing Record ID (Abnormal Case)**

**Description:** Tests viewing medical record when record ID is missing.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- recordId: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID352: View Medical Record Detail - Not a Doctor (Abnormal Case)**

**Description:** Tests viewing medical record detail when user is not a doctor.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not DOCTOR)

**Inputs:**
- JWT token in Authorization header (patient account)
- recordId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `403 Forbidden` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID353: View Medical Record Detail - Database Connection Error (Abnormal Case)**

**Description:** Tests viewing medical record detail when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Medical record exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- recordId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra khi lấy chi tiết hồ sơ bệnh án." }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: verifyMedicalRecord (Doctor)

### Function Details
- **Function Name:** `verifyMedicalRecord`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~18 lines (325-341)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID354: Verify Medical Record Successfully (Normal Case)**

**Description:** Tests successful verification of medical record.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Medical record exists
- Medical record needs verification

**Inputs:**
- JWT token in Authorization header
- recordId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { medicalRecord: {...} }, message: "Xác nhận hồ sơ bệnh án thành công." }`
- Medical record verified
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID355: Verify Medical Record - Unauthorized (Abnormal Case)**

**Description:** Tests verifying medical record without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- recordId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Medical record not verified
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID356: Verify Medical Record - Record Not Found (Abnormal Case)**

**Description:** Tests verifying non-existent medical record.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Medical record does not exist

**Inputs:**
- JWT token in Authorization header
- recordId: Non-existent medical record ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error` or `404 Not Found` (depending on implementation)
- Response: Error message
- Medical record not verified
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID357: Verify Medical Record - Invalid Record ID Format (Abnormal Case)**

**Description:** Tests verifying medical record with invalid ID format.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- recordId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `400 Bad Request` (depending on validation)
- Response: Error message
- Medical record not verified
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID358: Verify Medical Record - Not a Doctor (Abnormal Case)**

**Description:** Tests verifying medical record when user is not a doctor.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not DOCTOR)

**Inputs:**
- JWT token in Authorization header (patient account)
- recordId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `403 Forbidden` or `500 Internal Server Error` (depending on implementation)
- Response: Error message
- Medical record not verified
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID359: Verify Medical Record - Database Connection Error (Abnormal Case)**

**Description:** Tests verifying medical record when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Medical record exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- recordId: Valid medical record ObjectID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra khi xác nhận hồ sơ bệnh án." }`
- Medical record not verified
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

**Tổng cộng:** 166 test cases cho 19 functions. Tiếp tục bổ sung các functions còn lại...

