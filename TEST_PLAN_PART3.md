# 📋 TEST PLAN PART 3 - CÁC FUNCTIONS CÒN LẠI

## 📊 TỔNG QUAN

File này chứa test cases cho các functions còn lại chưa được bổ sung trong `TEST_PLAN_COMPLETE.md` và `TEST_PLAN_PART2.md`.

---

## 👨‍⚕️ DOCTOR CONTROLLER (Tiếp tục)

### 🧪 TEST CASES CHO FUNCTION: viewListMedicalRecordsVerify

### Function Details
- **Function Name:** `viewListMedicalRecordsVerify`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~19 lines (242-260)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID360: View List Medical Records Verify Successfully (Normal Case)**

**Description:** Tests successful retrieval of medical records that need verification.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Medical records need verification exist

**Inputs:**
- JWT token in Authorization header
- page: (optional) `1`
- limit: (optional) `10`
- search: (optional) `"keyword"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: {...}, message: "Lấy danh sách hồ sơ bệnh án thành công." }`
- Only records needing verification returned
- Pagination info included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID361: View List Medical Records Verify - Unauthorized (Abnormal Case)**

**Description:** Tests viewing medical records needing verification without authentication.

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

### **UTCID362: View List Medical Records Verify - No Records Need Verification (Normal Case)**

**Description:** Tests viewing when no medical records need verification.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- No medical records need verification

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

### **UTCID363: View List Medical Records Verify with Search (Normal Case)**

**Description:** Tests viewing medical records needing verification with search filter.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Medical records need verification exist

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

### **UTCID364: View List Medical Records Verify with Pagination (Normal Case)**

**Description:** Tests viewing medical records needing verification with pagination.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- More than 10 medical records need verification

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

### **UTCID365: View List Medical Records Verify - Not a Doctor (Abnormal Case)**

**Description:** Tests viewing medical records needing verification when user is not a doctor.

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

### **UTCID366: View List Medical Records Verify - Invalid Page Number (Boundary Case)**

**Description:** Tests viewing medical records needing verification with invalid page number.

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

### **UTCID367: View List Medical Records Verify - Database Connection Error (Abnormal Case)**

**Description:** Tests viewing medical records needing verification when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Medical records exist (in disconnected database)

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

## 🧪 TEST CASES CHO FUNCTION: viewListMedicalRecordsByPatient

### Function Details
- **Function Name:** `viewListMedicalRecordsByPatient`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~19 lines (263-281)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID368: View List Medical Records by Patient Successfully (Normal Case)**

**Description:** Tests successful retrieval of medical records for specific patient.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Patient has medical records
- Doctor has access to patient's records

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID
- page: (optional) `1`
- limit: (optional) `10`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { records: [...] }, pagination: {...}, message: "Lấy danh sách hồ sơ bệnh án thành công." }`
- Patient's medical records returned
- Pagination info included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID369: View List Medical Records by Patient - Unauthorized (Abnormal Case)**

**Description:** Tests viewing patient's medical records without authentication.

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

### **UTCID370: View List Medical Records by Patient - Patient Has No Records (Normal Case)**

**Description:** Tests viewing when patient has no medical records.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Patient has no medical records

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID (no records)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { records: [] }, pagination: { page: 1, limit: 10, total: 0 }, message: "Lấy danh sách hồ sơ bệnh án thành công." }`
- Empty records list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID371: View List Medical Records by Patient - Patient Not Found (Abnormal Case)**

**Description:** Tests viewing medical records for non-existent patient.

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
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID372: View List Medical Records by Patient - No Access Permission (Security Test)**

**Description:** Tests viewing patient's medical records when doctor has no access.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Patient has medical records
- Doctor has no access permission

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID (no access)

**Expected Outcome:**
- Return: `200 OK` or `403 Forbidden` (depending on implementation)
- Response: Empty list or error message
- System should prevent unauthorized access
- Exception: (None)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID373: View List Medical Records by Patient - Invalid Patient ID Format (Abnormal Case)**

**Description:** Tests viewing medical records with invalid patient ID format.

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

### **UTCID374: View List Medical Records by Patient with Pagination (Normal Case)**

**Description:** Tests viewing patient's medical records with pagination.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Patient exists
- Patient has more than 10 medical records

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID
- page: `2`
- limit: `5`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { records: [...] }, pagination: { page: 2, limit: 5, total: ... }, message: "Lấy danh sách hồ sơ bệnh án thành công." }`
- Only 5 records returned (page 2)
- Pagination info correct
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID375: View List Medical Records by Patient - Database Connection Error (Abnormal Case)**

**Description:** Tests viewing patient's medical records when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Patient exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- patientId: Valid patient ObjectID

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

## 🧪 TEST CASES CHO FUNCTION: viewFeedbackList (Doctor)

### Function Details
- **Function Name:** `viewFeedbackList`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~12 lines (345-355)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID376: View Feedback List Successfully (Normal Case)**

**Description:** Tests successful retrieval of feedback list for doctor.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has feedback

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], message: "Lấy danh sách phản hồi thành công." }`
- Feedback list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID377: View Feedback List - Unauthorized (Abnormal Case)**

**Description:** Tests viewing feedback list without authentication.

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

### **UTCID378: View Feedback List - No Feedback (Normal Case)**

**Description:** Tests viewing feedback list when doctor has no feedback.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Doctor has no feedback

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [], message: "Lấy danh sách phản hồi thành công." }`
- Empty feedback list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID379: View Feedback List - Not a Doctor (Abnormal Case)**

**Description:** Tests viewing feedback list when user is not a doctor.

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

### **UTCID380: View Feedback List - Doctor Not Found (Abnormal Case)**

**Description:** Tests viewing feedback list when doctor does not exist.

**Preconditions:**
- Can connect with server
- User is authenticated
- Doctor record does not exist for account

**Inputs:**
- JWT token in Authorization header (account exists but no doctor record)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `404 Not Found` (depending on implementation)
- Response: Error message
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID381: View Feedback List - Database Connection Error (Abnormal Case)**

**Description:** Tests viewing feedback list when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated
- Doctor has feedback (in disconnected database)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra khi lấy danh sách phản hồi." }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: createAssistant (Doctor)

### Function Details
- **Function Name:** `createAssistant`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Lines of code:** ~29 lines (359-387)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID382: Create Assistant Successfully (Normal Case)**

**Description:** Tests successful creation of assistant account by doctor.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Email does not exist in database
- Username does not exist in database

**Inputs:**
- JWT token in Authorization header
- email: `"assistant@example.com"`
- username: `"assistant123"`
- password: `"ValidPass123!@#"`
- phone_number: `"0123456789"`
- full_name: `"Nguyen Van A"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { assistant: {...} }, message: "Tạo tài khoản trợ lý thành công." }`
- Assistant account created
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID383: Create Assistant - Unauthorized (Abnormal Case)**

**Description:** Tests creating assistant account without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- email: `"assistant@example.com"`
- username: `"assistant123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ success: false, error: "Unauthorized" }`
- Assistant account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID384: Create Assistant - Not a Doctor (Abnormal Case)**

**Description:** Tests creating assistant account when user is not a doctor.

**Preconditions:**
- Can connect with server
- User is authenticated
- User role is PATIENT (not DOCTOR)

**Inputs:**
- JWT token in Authorization header (patient account)
- email: `"assistant@example.com"`
- username: `"assistant123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request` or `403 Forbidden` (depending on implementation)
- Response: `{ success: false, message: "Truy cập bị từ chối: Không tìm thấy bác sĩ." }` or similar
- Assistant account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID385: Create Assistant - Missing Required Fields (Abnormal Case)**

**Description:** Tests creating assistant account when required fields are missing.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- email: `undefined` or `null` or `""`
- username: `"assistant123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, message: "Vui lòng cung cấp đầy đủ thông tin." }` or similar
- Assistant account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID386: Create Assistant - Duplicate Email (Abnormal Case)**

**Description:** Tests creating assistant account with duplicate email.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Email already exists in database

**Inputs:**
- JWT token in Authorization header
- email: `"existing@example.com"` (already exists)
- username: `"assistant123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, message: "Email đã tồn tại" }` or similar
- Assistant account not created
- Exception: Database duplicate key error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID387: Create Assistant - Duplicate Username (Abnormal Case)**

**Description:** Tests creating assistant account with duplicate username.

**Preconditions:**
- Can connect with server
- Doctor is authenticated
- Username already exists in database

**Inputs:**
- JWT token in Authorization header
- email: `"assistant@example.com"`
- username: `"existinguser"` (already exists)
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, message: "Username đã tồn tại" }` or similar
- Assistant account not created
- Exception: Database duplicate key error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID388: Create Assistant - Invalid Email Format (Abnormal Case)**

**Description:** Tests creating assistant account with invalid email format.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- email: `"invalid-email-format"`
- username: `"assistant123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, message: "Email không hợp lệ" }` or similar
- Assistant account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID389: Create Assistant - Weak Password (Abnormal Case)**

**Description:** Tests creating assistant account with weak password.

**Preconditions:**
- Can connect with server
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- email: `"assistant@example.com"`
- username: `"assistant123"`
- password: `"weak"` (too short, no uppercase/special)

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, message: "Mật khẩu không đáp ứng yêu cầu" }` or similar
- Assistant account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID390: Create Assistant - Doctor Not Found (Abnormal Case)**

**Description:** Tests creating assistant account when doctor does not exist.

**Preconditions:**
- Can connect with server
- User is authenticated
- Doctor record does not exist for account

**Inputs:**
- JWT token in Authorization header (account exists but no doctor record)
- email: `"assistant@example.com"`
- username: `"assistant123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, message: "Truy cập bị từ chối: Không tìm thấy bác sĩ." }` or similar
- Assistant account not created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID391: Create Assistant - Database Connection Error (Abnormal Case)**

**Description:** Tests creating assistant account when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor is authenticated

**Inputs:**
- JWT token in Authorization header
- email: `"assistant@example.com"`
- username: `"assistant123"`
- password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Có lỗi xảy ra khi tạo tài khoản trợ lý." }`
- Assistant account not created
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: banOrUnbanAssistant (Doctor)

### Function Details
- **Function Name:** `banOrUnbanAssistant`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Endpoint:** `PUT /doctor/assistants/:assistantId/ban`
- **Behavior (theo code):** Trả 400 cho lỗi input/user errors; 500 cho lỗi hệ thống

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10

---

### UTCID392: Ban assistant successfully (Normal)

**Preconditions:**
- Server reachable
- Authenticated doctor
- Assistant exists, active

**Inputs:**
- Authorization: Bearer <doctor_token>
- Params: `assistantId=validId`
- Body: `{ status: "BANNED" }`

**Expected Outcome:**
- 200 OK
- `{ success: true, data: { message }, message }`
- Message indicates update success

**Result:** N/U

---

### UTCID393: Unban assistant successfully (Normal)

**Preconditions:** Same as UTCID392, assistant currently banned

**Inputs:**
- Body: `{ status: "ACTIVE" }`

**Expected Outcome:** 200 OK, success message

**Result:** N/U

---

### UTCID394: Missing assistantId (Abnormal)

**Inputs:** Params missing `assistantId`

**Expected Outcome:** 400 Bad Request with message contains "Thiếu assistantId"

**Result:** A/U

---

### UTCID395: Invalid status value (Abnormal)

**Inputs:** Body: `{ status: "UNKNOWN" }`

**Expected Outcome:** 400 Bad Request message includes "Trạng thái không hợp lệ"

**Result:** A/U

---

### UTCID396: Assistant not found (Abnormal)

**Inputs:** `assistantId=notExist`

**Expected Outcome:** 400 Bad Request message includes "Không tìm thấy"

**Result:** A/U

---

### UTCID397: Cannot update assistant (Abnormal)

**Preconditions:** Service returns error "Không thể cập nhật"

**Expected Outcome:** 400 Bad Request with that message

**Result:** A/U

---

### UTCID398: Unauthorized user (Abnormal)

**Inputs:** No Authorization header

**Expected Outcome:** 401 Unauthorized

**Result:** A/U

---

### UTCID399: Forbidden (not a doctor) (Abnormal)

**Inputs:** Authorization: patient token

**Expected Outcome:** 403 Forbidden (or 400/500 depending middleware), no state change

**Result:** A/U

---

### UTCID400: Database/server error (Abnormal)

**Preconditions:** Service throws unexpected error

**Expected Outcome:** 500 Internal Server Error with message "Có lỗi xảy ra khi cập nhật trạng thái trợ lý."

**Result:** A/U

---

## 🧪 TEST CASES CHO FUNCTION: viewListAssistants (Doctor)

### Function Details
- **Function Name:** `viewListAssistants`
- **File:** `backend/src/controller/doctor/doctor.controler.js`
- **Endpoint:** `GET /doctor/assistants`

### Test Summary
- **Total Test Cases:** 8

---

### UTCID401: Get assistants successfully (Normal)

**Preconditions:** Authenticated doctor; assistants exist

**Inputs:** Authorization header; optional `page, limit, search`

**Expected Outcome:** 200 OK with `data: assistants[]`, `pagination`, message "Lấy danh sách trợ lý thành công."

**Result:** N/U

---

### UTCID402: Empty assistants list (Normal)

**Preconditions:** No assistants

**Expected Outcome:** 200 OK with `data: []`, correct pagination

**Result:** N/U

---

### UTCID403: With pagination params (Normal)

**Inputs:** `page=2`, `limit=5`

**Expected Outcome:** 200 OK, 5 items of page 2, accurate totals

**Result:** N/U

---

### UTCID404: With search filter (Normal)

**Inputs:** `search="keyword"`

**Expected Outcome:** 200 OK, only matching assistants returned

**Result:** N/U

---

### UTCID405: Unauthorized (Abnormal)

**Inputs:** Missing/invalid token

**Expected Outcome:** 401 Unauthorized

**Result:** A/U

---

### UTCID406: Forbidden non-doctor (Abnormal)

**Inputs:** Patient token

**Expected Outcome:** 403 Forbidden (or handled upstream)

**Result:** A/U

---

### UTCID407: Invalid pagination values (Boundary)

**Inputs:** `page=0`, `limit=-5`

**Expected Outcome:** 200 OK; defaults applied or clamped; no crash

**Result:** B/U

---

### UTCID408: Server error on fetch (Abnormal)

**Preconditions:** Service throws error

**Expected Outcome:** 500 Internal Server Error with message "Có lỗi xảy ra khi lấy danh sách trợ lý."

**Result:** A/U

---

## 🧪 TEST CASES CHO FUNCTION: viewProfile (Doctor)

### Function Details
- **Function Name:** `viewProfile`
- **Endpoint:** `GET /doctor/profile`

### Test Summary
- **Total Test Cases:** 6

---

### UTCID409: View profile successfully (Normal)

**Preconditions:** Authenticated doctor; profile exists

**Expected Outcome:** 200 OK with doctor profile data

**Result:** N/U

---

### UTCID410: Unauthorized (Abnormal)

**Expected Outcome:** 401 Unauthorized

**Result:** A/U

---

### UTCID411: Doctor account not found (Abnormal)

**Expected Outcome:** 404 Not Found (or 500 via error handler)

**Result:** A/U

---

### UTCID412: Non-doctor role (Abnormal)

**Expected Outcome:** 403 Forbidden (middleware) or error

**Result:** A/U

---

### UTCID413: Logs user id (Observation)

**Expected Outcome:** Console logs contain `User ID: <sub>`

**Result:** N/U

---

### UTCID414: Server error (Abnormal)

**Expected Outcome:** 500 Internal Server Error (handled by next(err))

**Result:** A/U

---

## 🧪 TEST CASES CHO FUNCTION: updateProfile (Doctor)

### Function Details
- **Function Name:** `updateProfile`
- **Endpoint:** `PUT /doctor/profile`

### Test Summary
- **Total Test Cases:** 10

---

### UTCID415: Update profile successfully (Normal)

**Inputs:** Valid body (name, phone, specialty, etc.)

**Expected Outcome:** 200 OK with updated fields

**Result:** N/U

---

### UTCID416: Unauthorized (Abnormal)

**Expected Outcome:** 401 Unauthorized

**Result:** A/U

---

### UTCID417: Invalid phone format (Abnormal)

**Inputs:** `phone="abc"`

**Expected Outcome:** 400 Bad Request (if validated) or ignored with 200

**Result:** A/U

---

### UTCID418: Invalid specialty id (Abnormal)

**Inputs:** `specialtyId="invalid"`

**Expected Outcome:** 400/500 error depending on validation

**Result:** A/U

---

### UTCID419: Missing required fields (Boundary)

**Inputs:** `{}` empty body

**Expected Outcome:** 200 OK (no changes) or 400 Bad Request (depending on service validation)

**Result:** B/U

---

### UTCID420: Oversized bio/description (Boundary)

**Inputs:** `bio` length > max

**Expected Outcome:** 400 Bad Request if limited; else 200 and truncated

**Result:** B/U

---

### UTCID421: Non-doctor (Abnormal)

**Expected Outcome:** 403 Forbidden or error

**Result:** A/U

---

### UTCID422: Profile not found (Abnormal)

**Expected Outcome:** 404 Not Found or 500

**Result:** A/U

---

### UTCID423: Concurrent update (Boundary)

**Preconditions:** Simulate version conflict if supported

**Expected Outcome:** 409 Conflict or last-write-wins

**Result:** B/U

---

### UTCID424: Server error (Abnormal)

**Expected Outcome:** 500 via next(err)

**Result:** A/U

---

## 🧪 TEST CASES CHO FUNCTION: uploadLicense (Doctor)

### Function Details
- **Function Name:** `uploadLicense`
- **Endpoint:** `POST /doctor/license`

### Test Summary
- **Total Test Cases:** 10

---

### UTCID425: Upload license successfully (Normal)

**Inputs:** Valid license payload or file reference

**Expected Outcome:** 200 OK with stored metadata

**Result:** N/U

---

### UTCID426: Unauthorized (Abnormal)

**Expected Outcome:** 401 Unauthorized

**Result:** A/U

---

### UTCID427: Missing license data (Abnormal)

**Expected Outcome:** 400 Bad Request

**Result:** A/U

---

### UTCID428: Invalid file type (Abnormal)

**Expected Outcome:** 400 Bad Request

**Result:** A/U

---

### UTCID429: File too large (Boundary)

**Expected Outcome:** 413 Payload Too Large or 400 depending limits

**Result:** B/U

---

### UTCID430: Non-doctor role (Abnormal)

**Expected Outcome:** 403 Forbidden

**Result:** A/U

---

### UTCID431: Duplicate submission (Boundary)

**Preconditions:** Existing pending/approved license

**Expected Outcome:** 409 Conflict or 400 with message

**Result:** B/U

---

### UTCID432: Virus scan failed (Abnormal)

**Preconditions:** Simulate scan failure

**Expected Outcome:** 400/422 Unprocessable

**Result:** A/U

---

### UTCID433: Storage error (Abnormal)

**Expected Outcome:** 500 Internal Server Error

**Result:** A/U

---

### UTCID434: DB error when saving metadata (Abnormal)

**Expected Outcome:** 500 Internal Server Error

**Result:** A/U

---

## 🧪 TEST CASES CHO FUNCTION: getLicense (Doctor)

### Function Details
- **Function Name:** `getLicense`
- **Endpoint:** `GET /doctor/license`

### Test Summary
- **Total Test Cases:** 6

---

### UTCID435: Get license successfully (Normal)

**Expected Outcome:** 200 OK with license info or status

**Result:** N/U

---

### UTCID436: Unauthorized (Abnormal)

**Expected Outcome:** 401 Unauthorized

**Result:** A/U

---

### UTCID437: Non-doctor role (Abnormal)

**Expected Outcome:** 403 Forbidden

**Result:** A/U

---

### UTCID438: No license found (Normal)

**Expected Outcome:** 200 OK with null/empty data, clear message

**Result:** N/U

---

### UTCID439: Invalid doctor id (Abnormal)

**Expected Outcome:** 400/500 depending on validation

**Result:** A/U

---

### UTCID440: Server error (Abnormal)

**Expected Outcome:** 500 Internal Server Error

**Result:** A/U

---

## 🧪 TEST CASES CHO FUNCTION: changePassword (Doctor)

### Function Details
- **Function Name:** `changePassword`
- **Endpoint:** `PUT /doctor/change-password`
- **Behavior (theo code):** Validate strings, required fields, min length 6, not equal old/new; 404 if account not found; status check; compare old; then service call; success message

### Test Summary
- **Total Test Cases:** 10

---

### UTCID441: Change password successfully (Normal)

**Inputs:** `{ oldPassword: "OldPass123!", newPassword: "NewPass123!" }`

**Expected Outcome:** 200 OK, message "Đổi mật khẩu thành công"

**Result:** N/U

---

### UTCID442: Missing fields (Abnormal)

**Inputs:** `{ oldPassword: "", newPassword: "" }`

**Expected Outcome:** 400 with message "Vui lòng nhập đủ..."

**Result:** A/U

---

### UTCID443: Invalid types (Abnormal)

**Inputs:** `{ oldPassword: 123, newPassword: {} }`

**Expected Outcome:** 400 with "Dữ liệu đầu vào không hợp lệ."

**Result:** A/U

---

### UTCID444: New password too short (Boundary)

**Inputs:** `newPassword="12345"`

**Expected Outcome:** 400 with "ít nhất 6 ký tự"

**Result:** B/U

---

### UTCID445: New equals old (Abnormal)

**Inputs:** same old/new

**Expected Outcome:** 400 with "không được giống mật khẩu cũ"

**Result:** A/U

---

### UTCID446: Account not found (Abnormal)

**Expected Outcome:** 404 "Không tìm thấy tài khoản."

**Result:** A/U

---

### UTCID447: Account status not ACTIVE (Abnormal)

**Expected Outcome:** 400 "Tài khoản không ở trạng thái..."

**Result:** A/U

---

### UTCID448: Old password mismatch (Abnormal)

**Expected Outcome:** 400 "Mật khẩu hiện tại không đúng."

**Result:** A/U

---

### UTCID449: Unauthorized (Abnormal)

**Expected Outcome:** 401 Unauthorized

**Result:** A/U

---

### UTCID450: Server error on service call (Abnormal)

**Expected Outcome:** 500 via next(err)

**Result:** A/U

---

## 🧭 ADMIN CLINIC CONTROLLER

### 🧪 TEST CASES CHO FUNCTION: getAllClinics

### Test Summary
- **Total Test Cases:** 8

---

### UTCID451: Get all clinics successfully (Normal)

**Inputs:** Admin token; optional `page, limit, search`

**Expected Outcome:** 200 OK, list + pagination

**Result:** N/U

---

### UTCID452: Empty list (Normal)

**Expected Outcome:** 200 OK with empty data

**Result:** N/U

---

### UTCID453: With pagination (Normal)

**Inputs:** `page=2, limit=10`

**Expected Outcome:** Correct slice + totals

**Result:** N/U

---

### UTCID454: With search (Normal)

**Inputs:** `search="city or name"`

**Expected Outcome:** Only matched clinics

**Result:** N/U

---

### UTCID455: Unauthorized (Abnormal)

**Expected Outcome:** 401 Unauthorized

**Result:** A/U

---

### UTCID456: Forbidden non-admin (Abnormal)

**Expected Outcome:** 403 Forbidden

**Result:** A/U

---

### UTCID457: Invalid pagination (Boundary)

**Inputs:** `page=0, limit=-1`

**Expected Outcome:** Defaults or 400

**Result:** B/U

---

### UTCID458: Server error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

### 🧪 TEST CASES CHO FUNCTION: getDoctorsOfAdminClinic

### Test Summary
- **Total Test Cases:** 8

---

### UTCID459: Get doctors successfully (Normal)

**Expected Outcome:** 200 OK list + pagination

**Result:** N/U

---

### UTCID460: Empty doctors list (Normal)

**Expected Outcome:** 200 OK empty list

**Result:** N/U

---

### UTCID461: Unauthorized (Abnormal)

**Expected Outcome:** 401

**Result:** A/U

---

### UTCID462: Forbidden non-admin (Abnormal)

**Expected Outcome:** 403

**Result:** A/U

---

### UTCID463: With search/pagination (Normal)

**Inputs:** `page, limit, search`

**Expected Outcome:** Correct results

**Result:** N/U

---

### UTCID464: Clinic not found for admin (Abnormal)

**Expected Outcome:** 404 or 400

**Result:** A/U

---

### UTCID465: DB error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

### UTCID466: Invalid query params (Boundary)

**Expected Outcome:** 400 or default handling

**Result:** B/U

---

### 🧪 TEST CASES CHO FUNCTION: createAccountAssistant (Admin Clinic)

### Test Summary
- **Total Test Cases:** 10

---

### UTCID467: Create assistant successfully (Normal)

**Inputs:** Valid email, username, password, clinic assignment

**Expected Outcome:** 201/200 with assistant info

**Result:** N/U

---

### UTCID468: Unauthorized (Abnormal)

**Expected Outcome:** 401

**Result:** A/U

---

### UTCID469: Forbidden non-admin (Abnormal)

**Expected Outcome:** 403

**Result:** A/U

---

### UTCID470: Missing required fields (Abnormal)

**Expected Outcome:** 400 with validation messages

**Result:** A/U

---

### UTCID471: Duplicate email (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID472: Duplicate username (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID473: Weak password (Boundary)

**Expected Outcome:** 400

**Result:** B/U

---

### UTCID474: Clinic not found (Abnormal)

**Expected Outcome:** 404/400

**Result:** A/U

---

### UTCID475: DB error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

### UTCID476: Email format invalid (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### 🧪 TEST CASES CHO FUNCTION: getAssistants (Admin Clinic)

### Test Summary
- **Total Test Cases:** 8

---

### UTCID477: Get assistants successfully (Normal)

**Expected Outcome:** 200 OK list + pagination

**Result:** N/U

---

### UTCID478: Empty list (Normal)

**Expected Outcome:** 200 OK empty array

**Result:** N/U

---

### UTCID479: With search/pagination (Normal)

**Expected Outcome:** 200 OK filtered slice

**Result:** N/U

---

### UTCID480: Unauthorized (Abnormal)

**Expected Outcome:** 401

**Result:** A/U

---

### UTCID481: Forbidden non-admin (Abnormal)

**Expected Outcome:** 403

**Result:** A/U

---

### UTCID482: Invalid query params (Boundary)

**Expected Outcome:** 400 or defaults

**Result:** B/U

---

### UTCID483: Clinic not found (Abnormal)

**Expected Outcome:** 404/400

**Result:** A/U

---

### UTCID484: DB/server error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

### 🧪 TEST CASES CHO FUNCTION: deleteAssistant (Admin Clinic)

### Test Summary
- **Total Test Cases:** 8

---

### UTCID485: Delete assistant successfully (Normal)

**Inputs:** `assistantId=valid`

**Expected Outcome:** 200 OK with confirmation

**Result:** N/U

---

### UTCID486: Unauthorized (Abnormal)

**Expected Outcome:** 401

**Result:** A/U

---

### UTCID487: Forbidden non-admin (Abnormal)

**Expected Outcome:** 403

**Result:** A/U

---

### UTCID488: Assistant not found (Abnormal)

**Expected Outcome:** 404/400

**Result:** A/U

---

### UTCID489: Invalid id format (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID490: Already deleted (Boundary)

**Expected Outcome:** 404/409

**Result:** B/U

---

### UTCID491: DB error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

### UTCID492: Cascade constraints (Boundary)

**Expected Outcome:** 409 Conflict if related records prevent delete

**Result:** B/U

---

### 🧪 TEST CASES CHO FUNCTION: getPendingLicenses (Admin Clinic)

### Test Summary
- **Total Test Cases:** 8

---

### UTCID493: Get pending licenses successfully (Normal)

**Expected Outcome:** 200 OK list + pagination

**Result:** N/U

---

### UTCID494: Empty pending list (Normal)

**Expected Outcome:** 200 OK empty array

**Result:** N/U

---

### UTCID495: Unauthorized (Abnormal)

**Expected Outcome:** 401

**Result:** A/U

---

### UTCID496: Forbidden non-admin (Abnormal)

**Expected Outcome:** 403

**Result:** A/U

---

### UTCID497: With filters/pagination (Normal)

**Expected Outcome:** 200 OK

**Result:** N/U

---

### UTCID498: DB error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

### UTCID499: Invalid query (Boundary)

**Expected Outcome:** 400 or default handling

**Result:** B/U

---

### UTCID500: Include doctor/assistant metadata (Normal)

**Expected Outcome:** 200 OK includes submitter info

**Result:** N/U

---

### 🧪 TEST CASES CHO FUNCTION: updateLicenseStatus (Admin Clinic)

### Test Summary
- **Total Test Cases:** 10

---

### UTCID501: Approve license successfully (Normal)

**Inputs:** `{ status:"APPROVED", note:"OK" }`

**Expected Outcome:** 200 OK, status updated

**Result:** N/U

---

### UTCID502: Reject license with reason (Normal)

**Inputs:** `{ status:"REJECTED", note:"Missing seal" }`

**Expected Outcome:** 200 OK, status updated

**Result:** N/U

---

### UTCID503: Unauthorized (Abnormal)

**Expected Outcome:** 401

**Result:** A/U

---

### UTCID504: Forbidden non-admin (Abnormal)

**Expected Outcome:** 403

**Result:** A/U

---

### UTCID505: Missing status (Abnormal)

**Expected Outcome:** 400 validation error

**Result:** A/U

---

### UTCID506: Invalid status value (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID507: License request not found (Abnormal)

**Expected Outcome:** 404/400

**Result:** A/U

---

### UTCID508: Id format invalid (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID509: DB error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

### UTCID510: Already approved/rejected (Boundary)

**Expected Outcome:** 409 Conflict or 400

**Result:** B/U

---

### 🧪 TEST CASES CHO FUNCTION: updateClinic (Admin Clinic)

### Test Summary
- **Total Test Cases:** 10

---

### UTCID511: Update clinic successfully (Normal)

**Inputs:** Valid name, address, phone, description

**Expected Outcome:** 200 OK with updated clinic

**Result:** N/U

---

### UTCID512: Unauthorized (Abnormal)

**Expected Outcome:** 401

**Result:** A/U

---

### UTCID513: Forbidden non-admin (Abnormal)

**Expected Outcome:** 403

**Result:** A/U

---

### UTCID514: Clinic not found (Abnormal)

**Expected Outcome:** 404/400

**Result:** A/U

---

### UTCID515: Invalid phone (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID516: Name too long (Boundary)

**Expected Outcome:** 400 or truncate + 200

**Result:** B/U

---

### UTCID517: Address incomplete (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID518: Duplicate clinic name (Boundary)

**Expected Outcome:** 409/400

**Result:** B/U

---

### UTCID519: DB error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

### UTCID520: Partial update allowed (Boundary)

**Inputs:** Only `description`

**Expected Outcome:** 200 OK, only changed fields updated

**Result:** B/U

---

### 🧪 TEST CASES CHO FUNCTION: deleteDoctor (Admin Clinic)

### Test Summary
- **Total Test Cases:** 8

---

### UTCID521: Delete doctor successfully (Normal)

**Inputs:** `doctorId=valid`

**Expected Outcome:** 200 OK confirmation

**Result:** N/U

---

### UTCID522: Unauthorized (Abnormal)

**Expected Outcome:** 401

**Result:** A/U

---

### UTCID523: Forbidden non-admin (Abnormal)

**Expected Outcome:** 403

**Result:** A/U

---

### UTCID524: Doctor not found (Abnormal)

**Expected Outcome:** 404/400

**Result:** A/U

---

### UTCID525: Invalid id format (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID526: Doctor has active appointments (Boundary)

**Expected Outcome:** 409 Conflict

**Result:** B/U

---

### UTCID527: DB error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

### UTCID528: Id belongs to assistant (Boundary)

**Expected Outcome:** 400 role mismatch

**Result:** B/U

---

## 🗺️ ADDRESS CONTROLLER

### 🧪 TEST CASES CHO FUNCTION: getProvinceOptions

### Test Summary
- **Total Test Cases:** 6

---

### UTCID529: Get provinces successfully (Normal)

**Expected Outcome:** 200 OK list of `{value,label}`

**Result:** N/U

---

### UTCID530: Empty dataset (Normal)

**Expected Outcome:** 200 OK empty array

**Result:** N/U

---

### UTCID531: With search query (Normal)

**Inputs:** `search="Ha Noi"`

**Expected Outcome:** 200 OK filtered results

**Result:** N/U

---

### UTCID532: Unauthorized (if protected) (Abnormal)

**Expected Outcome:** 401 (if endpoint requires auth), else 200

**Result:** A/U

---

### UTCID533: Server error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

### UTCID534: Performance for large list (Boundary)

**Expected Outcome:** Response < threshold, pagination if any

**Result:** B/U

---

### 🧪 TEST CASES CHO FUNCTION: getWardsByProvince

### Test Summary
- **Total Test Cases:** 6

---

### UTCID535: Get wards by province successfully (Normal)

**Inputs:** `provinceId=valid`

**Expected Outcome:** 200 OK list of wards

**Result:** N/U

---

### UTCID536: Province not found (Abnormal)

**Expected Outcome:** 404/400

**Result:** A/U

---

### UTCID537: Invalid provinceId format (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID538: Empty wards (Normal)

**Expected Outcome:** 200 OK empty array

**Result:** N/U

---

### UTCID539: Unauthorized (if protected) (Abnormal)

**Expected Outcome:** 401 (if applicable)

**Result:** A/U

---

### UTCID540: Server error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

---

## 👤 USER CONTROLLER

### 🧪 TEST CASES CHO FUNCTION: updateSettings

### Test Summary
- **Total Test Cases:** 10

---

### UTCID541: Update settings successfully (Normal)

**Inputs:** `{ notifications:true, language:"vi", timezone:"UTC+7", theme:"dark" }`

**Expected Outcome:** 200 OK persisted settings

**Result:** N/U

---

### UTCID542: Unauthorized (Abnormal)

**Expected Outcome:** 401

**Result:** A/U

---

### UTCID543: Invalid language code (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID544: Invalid timezone format (Abnormal)

**Expected Outcome:** 400

**Result:** A/U

---

### UTCID545: Invalid theme (Boundary)

**Inputs:** `theme="neon"`

**Expected Outcome:** 400 or fallback to default

**Result:** B/U

---

### UTCID546: Partial update (Boundary)

**Inputs:** `{ notifications:false }`

**Expected Outcome:** 200 OK only changed field updated

**Result:** B/U

---

### UTCID547: Settings not found (Abnormal)

**Expected Outcome:** 404/400

**Result:** A/U

---

### UTCID548: Payload too large (Boundary)

**Expected Outcome:** 413/400

**Result:** B/U

---

### UTCID549: Concurrency update (Boundary)

**Expected Outcome:** 409 or last-write-wins

**Result:** B/U

---

### UTCID550: Server/DB error (Abnormal)

**Expected Outcome:** 500

**Result:** A/U

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

**Lưu ý:** File này sẽ tiếp tục được bổ sung test cases cho các functions còn lại:
- Doctor Controller: banOrUnbanAssistant, viewListAssistants, viewProfile, updateProfile, uploadLicense, getLicense, changePassword
- Admin Clinic Controller: getAllClinics, getDoctorsOfAdminClinic, createAccountAssistant, getAssistants, deleteAssistant, getPendingLicenses, updateLicenseStatus, updateClinic, deleteDoctor
- Address Controller: getProvinceOptions, getWardsByProvince
- User Controller: updateSettings

