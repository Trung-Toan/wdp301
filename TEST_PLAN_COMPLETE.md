# 📋 TEST PLAN - DANH SÁCH FUNCTIONS VÀ TEST CASES

## 📊 TỔNG QUAN

Tài liệu này liệt kê tất cả các functions trong codebase và cung cấp test cases chi tiết cho unit testing, theo định dạng tương tự như trong ảnh mẫu.

---

## 📝 DANH SÁCH CÁC FUNCTIONS

### 🔐 AUTH CONTROLLER (backend/src/controller/auth/auth.controller.js)

1. **registerPatients** - Đăng ký tài khoản bệnh nhân/clinic owner (Lines: 57-156)
2. **googleLogin** - Đăng nhập bằng Google (Lines: 13-55)
3. **verifyEmail** - Xác minh email (Lines: 159-169)
4. **login** - Đăng nhập (Lines: 171-186)
5. **refresh** - Refresh token (Lines: 188-203)
6. **logout** - Đăng xuất (Lines: 205-213)
7. **requestVerifyEmail** - Yêu cầu gửi lại email xác minh (Lines: 215-223)
8. **requestPasswordReset** - Yêu cầu reset mật khẩu (Lines: 225-233)
9. **resetPassword** - Reset mật khẩu (Lines: 235-243)
10. **changePassword** - Đổi mật khẩu (Lines: 245-269)

### 📅 APPOINTMENT CONTROLLER (backend/src/controller/appoinment/appointment.controller.js)

11. **create** - Tạo cuộc hẹn mới (Lines: 10-32)
12. **getById** - Lấy thông tin cuộc hẹn theo ID (Lines: 34-41)
13. **getByPatient** - Lấy danh sách cuộc hẹn của bệnh nhân (Lines: 43-63)
14. **getAvailableSlots** - Lấy các slot khả dụng (Lines: 68-90)
15. **checkSlotAvailability** - Kiểm tra tính khả dụng của slot (Lines: 95-138)

### 👨‍⚕️ DOCTOR CONTROLLER (backend/src/controller/doctor/doctor.controler.js)

16. **viewListPatients** - Xem danh sách bệnh nhân (Lines: 12-35)
17. **viewPatientById** - Xem thông tin bệnh nhân theo ID (Lines: 38-63)
18. **viewAppointments** - Xem danh sách cuộc hẹn (Lines: 67-92)
19. **viewAppointmentDetail** - Xem chi tiết cuộc hẹn (Lines: 95-115)
20. **requestViewMedicalRecord** - Yêu cầu xem hồ sơ bệnh án (Lines: 119-156)
21. **requestViewMedicalRecordById** - Yêu cầu xem hồ sơ bệnh án theo ID (Lines: 159-195)
22. **viewHistoryMedicalRecordRequests** - Xem lịch sử yêu cầu hồ sơ bệnh án (Lines: 198-216)
23. **viewListMedicalRecords** - Xem danh sách hồ sơ bệnh án (Lines: 220-238)
24. **viewListMedicalRecordsVerify** - Xem danh sách hồ sơ bệnh án cần xác minh (Lines: 241-259)
25. **viewListMedicalRecordsByPatient** - Xem danh sách hồ sơ bệnh án của bệnh nhân (Lines: 262-280)
26. **viewMedicalRecordDetail** - Xem chi tiết hồ sơ bệnh án (Lines: 283-314)
27. **verifyMedicalRecord** - Xác minh hồ sơ bệnh án (Lines: 317-333)
28. **viewFeedbackList** - Xem danh sách phản hồi (Lines: 337-347)
29. **createAssistant** - Tạo tài khoản trợ lý (Lines: 351-379)
30. **banOrUnbanAssistant** - Cấm/Bỏ cấm trợ lý (Lines: 382-406)
31. **viewListAssistants** - Xem danh sách trợ lý (Lines: 409-429)
32. **viewProfile** - Xem profile bác sĩ (Lines: 433-441)
33. **updateProfile** - Cập nhật profile bác sĩ (Lines: 444-451)
34. **uploadLicense** - Tải lên giấy phép hành nghề (Lines: 454-465)
35. **getLicense** - Lấy thông tin giấy phép hành nghề (Lines: 468-475)

### 🏥 CLINIC CONTROLLER

36. **getAllClinic** - Lấy danh sách tất cả phòng khám (backend/src/controller/clinic/clinic.controller.js, Lines: 3-10)

### 👤 USER/PATIENT CONTROLLER

37. **setLocation** - Thiết lập vị trí bệnh nhân (backend/src/controller/patient/patient.controller.js, Lines: 3-23)
38. **getMyProfile** - Lấy profile của tôi (backend/src/controller/user/profile.controller.js, Lines: 8-41)
39. **updateMyProfile** - Cập nhật profile của tôi (backend/src/controller/user/profile.controller.js, Lines: 43-146)
40. **updateSettings** - Cập nhật cài đặt (backend/src/controller/user/profile.controller.js, Lines: 149-178)

### 🔔 NOTIFICATION CONTROLLER (backend/src/controller/notification/notification.controller.js)

41. **getNotifications** - Lấy danh sách thông báo (Lines: 7-33)
42. **markAsRead** - Đánh dấu đã đọc (Lines: 39-57)
43. **markAllAsRead** - Đánh dấu tất cả đã đọc (Lines: 63-80)
44. **getUnreadCount** - Lấy số lượng chưa đọc (Lines: 86-103)
45. **deleteNotification** - Xóa thông báo (Lines: 109-127)

### 🏥 ADMIN CLINIC CONTROLLER (backend/src/controller/admin_clinic/admin_clinic.controller.js)

46. **createAccountDoctor** - Tạo tài khoản bác sĩ (Lines: 13-29)
47. **getClinicByAdmin** - Lấy phòng khám theo admin (Lines: 32-40)
48. **getDoctorsOfAdminClinic** - Lấy danh sách bác sĩ của phòng khám (Lines: 43-67)
49. **createAccountAssistant** - Tạo tài khoản trợ lý (Lines: 70-86)
50. **getAssistants** - Lấy danh sách trợ lý (Lines: 89-103)
51. **deleteAssistant** - Xóa trợ lý (Lines: 106-113)
52. **getPendingLicenses** - Lấy danh sách giấy phép chờ duyệt (Lines: 116-126)
53. **updateLicenseStatus** - Cập nhật trạng thái giấy phép (Lines: 129-145)

---

## 🧪 TEST CASES CHO FUNCTION: registerPatients

### Function Details
- **Function Name:** `registerPatients`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** 94 lines (57-156)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 15
- **Passed:** 0
- **Failed:** 0
- **Untested:** 15
- **N/A/B (Not Applicable/Abnormal/Boundary):** 0

---

### **UTCID01: Successful Registration - Patient (Normal Case)**

**Description:** Tests the successful creation of a new patient account with valid inputs.

**Preconditions:**
- Can connect with server
- Not login yet
- Email does not exist in database
- Username does not exist in database

**Inputs:**
- Email: `newuser@example.com`
- Username: `"newusername"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Nguyen Van A"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Main Street"`
- Province_code: `"01"`
- Ward_code: `"001"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, message: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.", data: { account, user, patient } }`
- Account created with status: `ACTIVE`
- Email verification token sent
- User record created
- Patient record created
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID02: Successful Registration - Admin Clinic (Normal Case)**

**Description:** Tests the successful creation of a new admin clinic account with valid inputs.

**Preconditions:**
- Can connect with server
- Not login yet
- Email does not exist in database
- Username does not exist in database

**Inputs:**
- Email: `clinicadmin@example.com`
- Username: `"clinicadmin"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0987654321"`
- Role: `"ADMIN_CLINIC"`
- FullName: `"Tran Thi B"`
- DOB: `"1985-05-15"`
- Gender: `"FEMALE"`
- Address: `"456 Clinic Street"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, message: "Đăng ký thành công! Tài khoản của bạn đang chờ phê duyệt. Vui lòng kiểm tra email để xác minh tài khoản.", data: { account, user, adminClinic } }`
- Account created with status: `PENDING`
- Email verification token sent
- User record created
- AdminClinic record created
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID03: Registration with Empty Email (Abnormal Case)**

**Description:** Tests the system's response when the email field is left empty.

**Preconditions:**
- Can connect with server
- Not login yet

**Inputs:**
- Email: `"" (empty)`
- Username: `"testuser"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Invalid data" }`
- Exception: `Invalid data` or validation error
- Log message: `Log input validation error`
- Account should not be created

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID04: Registration with Invalid Email Format (Abnormal Case)**

**Description:** Tests the system's response to an email address that does not conform to a valid format.

**Preconditions:**
- Can connect with server
- Not login yet

**Inputs:**
- Email: `"invalid-email-format"`
- Username: `"testuser"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Invalid data" }`
- Exception: `Invalid data` or email validation error
- Log message: `Log input validation error`
- Account should not be created

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID05: Registration with Empty Username (Abnormal Case)**

**Description:** Tests the system's response when the username field is left empty.

**Preconditions:**
- Can connect with server
- Not login yet
- Email does not exist in database

**Inputs:**
- Email: `"test@example.com"`
- Username: `"" (empty)`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Invalid data" }`
- Exception: `Invalid data` or validation error
- Log message: `Log input validation error`
- Account should not be created

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID06: Registration with Invalid Password Format - Too Short (Abnormal Case)**

**Description:** Tests the system's response to a password that is too short.

**Preconditions:**
- Can connect with server
- Not login yet
- Email does not exist in database
- Username does not exist in database

**Inputs:**
- Email: `"test@example.com"`
- Username: `"testuser"`
- Password: `"abc123"` (too short, no uppercase/special)
- ConfirmPassword: `"abc123"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Invalid data" }`
- Exception: `Invalid data` or password validation error
- Log message: `Log input validation error`
- Account should not be created

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID07: Registration with Empty Password (Abnormal Case)**

**Description:** Tests the system's response when the password field is left empty.

**Preconditions:**
- Can connect with server
- Not login yet
- Email does not exist in database
- Username does not exist in database

**Inputs:**
- Email: `"test@example.com"`
- Username: `"testuser"`
- Password: `"" (empty)`
- ConfirmPassword: `""`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Invalid data" }`
- Exception: `Invalid data` or validation error
- Log message: `Log input validation error`
- Account should not be created

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID08: Registration with Password Mismatch (Abnormal Case)**

**Description:** Tests the system's response when password and confirmPassword do not match.

**Preconditions:**
- Can connect with server
- Not login yet
- Email does not exist in database
- Username does not exist in database

**Inputs:**
- Email: `"test@example.com"`
- Username: `"testuser"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"DifferentPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Mật khẩu xác nhận không khớp" }`
- Exception: (None)
- Log message: (None)
- Account should not be created

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID09: Registration with Invalid Role (Abnormal Case)**

**Description:** Tests the system's response when an invalid role is provided.

**Preconditions:**
- Can connect with server
- Not login yet
- Email does not exist in database
- Username does not exist in database

**Inputs:**
- Email: `"test@example.com"`
- Username: `"testuser"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"INVALID_ROLE"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Loại tài khoản không hợp lệ" }`
- Exception: (None)
- Log message: (None)
- Account should not be created

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID10: Registration with Duplicate Email (Abnormal Case)**

**Description:** Tests the system's response when trying to register with an email that already exists.

**Preconditions:**
- Can connect with server
- Not login yet
- Email already exists in database

**Inputs:**
- Email: `"existing@example.com"` (already exists)
- Username: `"newuser"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Email already exists" }` or similar error
- Exception: Database duplicate key error
- Log message: Error log
- Account should not be created

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID11: Registration with Duplicate Username (Abnormal Case)**

**Description:** Tests the system's response when trying to register with a username that already exists.

**Preconditions:**
- Can connect with server
- Not login yet
- Username already exists in database
- Email does not exist in database

**Inputs:**
- Email: `"newemail@example.com"`
- Username: `"existinguser"` (already exists)
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Username already exists" }` or similar error
- Exception: Database duplicate key error
- Log message: Error log
- Account should not be created

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID12: Registration with Missing FullName (Boundary Case)**

**Description:** Tests the system's response when FullName is missing.

**Preconditions:**
- Can connect with server
- Not login yet
- Email does not exist in database
- Username does not exist in database

**Inputs:**
- Email: `"test@example.com"`
- Username: `"testuser"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `""` or `undefined`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request` or `200 OK` (depending on validation)
- Response: Error message if required, or success if optional
- Exception: (Depends on validation rules)
- Log message: (Depends on validation rules)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID13: Registration with Invalid Phone Number Format (Abnormal Case)**

**Description:** Tests the system's response when phone number has invalid format.

**Preconditions:**
- Can connect with server
- Not login yet
- Email does not exist in database
- Username does not exist in database

**Inputs:**
- Email: `"test@example.com"`
- Username: `"testuser"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"invalid-phone"`
- Role: `"PATIENT"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request` or `200 OK` (depending on validation)
- Response: Error message if phone validation is strict
- Exception: (Depends on validation rules)
- Log message: (Depends on validation rules)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID14: Registration with Very Long Email (Boundary Case)**

**Description:** Tests the system's response when email is extremely long.

**Preconditions:**
- Can connect with server
- Not login yet

**Inputs:**
- Email: `"a".repeat(250) + "@example.com"` (very long email)
- Username: `"testuser"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Test User"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Invalid data" }`
- Exception: Validation error or database error
- Log message: Error log

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID15: Registration with SQL Injection Attempt (Security Test)**

**Description:** Tests the system's response to SQL injection attempts in input fields.

**Preconditions:**
- Can connect with server
- Not login yet

**Inputs:**
- Email: `"test'; DROP TABLE users; --@example.com"`
- Username: `"admin' OR '1'='1"`
- Password: `"ValidPass123!@#"`
- ConfirmPassword: `"ValidPass123!@#"`
- Phone_number: `"0123456789"`
- Role: `"PATIENT"`
- FullName: `"Test'; DROP TABLE users; --"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Address: `"123 Test Street"`

**Expected Outcome:**
- Return: `400 Bad Request` or `200 OK` (should be sanitized)
- Response: Should handle safely without executing SQL
- Exception: (None, should be handled safely)
- Log message: May log security attempt
- Account should either be rejected or created safely with sanitized data

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: login

### Function Details
- **Function Name:** `login`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** ~15 lines (171-186)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID16: Successful Login (Normal Case)**

**Description:** Tests successful login with valid credentials.

**Preconditions:**
- Can connect with server
- Account exists in database
- Account status is ACTIVE
- Email is verified (or verification not required)
- Password is correct

**Inputs:**
- Email: `"user@example.com"`
- Password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, account: {...}, user: {...}, patient: {...}, tokens: { accessToken, refreshToken, refreshExpiresAt }, mustVerify: false }`
- LoginAttempt record created with ok: true
- Session created
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID17: Login with Wrong Email (Abnormal Case)**

**Description:** Tests login with non-existent email.

**Preconditions:**
- Can connect with server
- Email does not exist in database

**Inputs:**
- Email: `"nonexistent@example.com"`
- Password: `"AnyPassword123"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Email hoặc mật khẩu sai" }`
- LoginAttempt record created with ok: false, reason: "not_found"
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID18: Login with Wrong Password (Abnormal Case)**

**Description:** Tests login with correct email but wrong password.

**Preconditions:**
- Can connect with server
- Account exists in database
- Account status is ACTIVE

**Inputs:**
- Email: `"user@example.com"`
- Password: `"WrongPassword123"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Email hoặc mật khẩu sai" }`
- LoginAttempt record created with ok: false, reason: "wrong_password"
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID19: Login with Inactive Account (Abnormal Case)**

**Description:** Tests login with account that has status other than ACTIVE.

**Preconditions:**
- Can connect with server
- Account exists in database
- Account status is PENDING or INACTIVE

**Inputs:**
- Email: `"pending@example.com"`
- Password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Tài khoản chưa active" }`
- LoginAttempt record created with ok: false, reason: "status_not_active"
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID20: Login with Empty Email (Abnormal Case)**

**Description:** Tests login with empty email field.

**Preconditions:**
- Can connect with server

**Inputs:**
- Email: `"" (empty)`
- Password: `"AnyPassword123"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Email hoặc mật khẩu sai" }` or validation error
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID21: Login with Empty Password (Abnormal Case)**

**Description:** Tests login with empty password field.

**Preconditions:**
- Can connect with server
- Account exists in database

**Inputs:**
- Email: `"user@example.com"`
- Password: `"" (empty)`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Email hoặc mật khẩu sai" }` or validation error
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID22: Login with Invalid Email Format (Abnormal Case)**

**Description:** Tests login with invalid email format.

**Preconditions:**
- Can connect with server

**Inputs:**
- Email: `"invalid-email-format"`
- Password: `"AnyPassword123"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Email hoặc mật khẩu sai" }`
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID23: Login with Case Sensitive Email (Boundary Case)**

**Description:** Tests if email is case-insensitive during login.

**Preconditions:**
- Can connect with server
- Account exists with email: `"User@Example.com"`
- Account status is ACTIVE

**Inputs:**
- Email: `"USER@EXAMPLE.COM"` (uppercase)
- Password: `"ValidPass123!@#"`

**Expected Outcome:**
- Return: `200 OK` (email should be normalized to lowercase)
- Response: `{ ok: true, ... }`
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID24: Login with Special Characters in Password (Boundary Case)**

**Description:** Tests login with password containing special characters.

**Preconditions:**
- Can connect with server
- Account exists with password containing special characters
- Account status is ACTIVE

**Inputs:**
- Email: `"user@example.com"`
- Password: `"P@ssw0rd!@#$%^&*()"`

**Expected Outcome:**
- Return: `200 OK` (if password matches)
- Response: `{ ok: true, ... }`
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID25: Login Rate Limiting (Security Test)**

**Description:** Tests if system prevents brute force attacks with rate limiting.

**Preconditions:**
- Can connect with server
- Account exists in database

**Inputs:**
- Email: `"user@example.com"`
- Password: `"WrongPassword"` (repeated 10+ times)

**Expected Outcome:**
- Return: `400 Bad Request` for first few attempts
- Return: `429 Too Many Requests` or account lockout after multiple failed attempts
- Response: Rate limit error message
- Exception: (None)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: create (Appointment)

### Function Details
- **Function Name:** `create`
- **File:** `backend/src/controller/appoinment/appointment.controller.js`
- **Lines of code:** ~22 lines (10-32)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 31
- **Passed:** 0
- **Failed:** 0
- **Untested:** 31
- **N/A/B:** 0

### 📌 Lưu ý về cách viết Test Cases:
- **Mỗi test case chỉ tập trung vào 1-2 trường cụ thể** cần test
- **Chỉ liệt kê các trường liên quan** đến mục tiêu test của test case đó
- **Các trường required khác** (full_name, phone, email) cần được cung cấp với giá trị hợp lệ
- **Các trường optional** có thể được ghi chú là "có thể bỏ qua" hoặc "cung cấp với giá trị hợp lệ"
- **Không cần liệt kê tất cả 15 trường** trong mỗi test case

---

### **UTCID26: Create Appointment Successfully (Normal Case)**

**Description:** Tests successful creation of a new appointment.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available
- Slot is not full
- Patient is authenticated

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- Scheduled_date: Valid future date
- Reason: `"Headache and fever"`
- *(Other optional fields: specialty_id, clinic_id, dob, gender, province_code, ward_code, address_text can be provided or omitted)*

**Expected Outcome:**
- Return: `201 Created`
- Response: `{ success: true, data: { appointment: {...} } }`
- Appointment created in database
- Slot booking count updated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID27: Create Appointment with Full Slot (Abnormal Case)**

**Description:** Tests creating appointment when slot is already full.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists
- Slot exists but is full (maxPatients reached)

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID (full slot)
- Full_name: `"Nguyen Van A"` *(required)*
- Phone: `"0123456789"` *(required)*
- Email: `"patient@example.com"` *(required)*
- Scheduled_date: Valid future date
- Reason: `"Headache"`
- *(Other fields: provided with valid values)*

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Slot is full" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID28: Create Appointment with Invalid Patient ID (Abnormal Case)**

**Description:** Tests creating appointment with invalid patient ID.

**Preconditions:**
- Can connect with server
- Patient does not exist

**Inputs:**
- Patient_id: Invalid ObjectID or non-existent ID *(focus of this test)*
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"` *(required)*
- Phone: `"0123456789"` *(required)*
- Email: `"patient@example.com"` *(required)*
- Scheduled_date: Valid future date
- Reason: `"Headache"`
- *(Other fields: provided with valid values)*

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Patient not found" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID29: Create Appointment with Invalid Slot ID (Abnormal Case)**

**Description:** Tests creating appointment with invalid slot ID.

**Preconditions:**
- Can connect with server
- Patient exists
- Slot does not exist

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Invalid ObjectID or non-existent ID
- Scheduled_date: Valid future date
- Symptoms: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Slot not found" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID30: Create Duplicate Appointment (Abnormal Case)**

**Description:** Tests creating duplicate appointment for same patient and slot.

**Preconditions:**
- Can connect with server
- Patient exists
- Appointment already exists for this patient and slot

**Inputs:**
- Patient_id: Valid ObjectID (with existing appointment)
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID (already booked by this patient)
- Scheduled_date: Same date as existing appointment
- Symptoms: `"Headache"`

**Expected Outcome:**
- Return: `409 Conflict`
- Response: `{ success: false, error: "Duplicate booking for this slot" }`
- Appointment should not be created
- Exception: Database duplicate key error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID31: Create Appointment with Missing Required Fields (Abnormal Case)**

**Description:** Tests creating appointment without required fields.

**Preconditions:**
- Can connect with server

**Inputs:**
- Patient_id: (missing)
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Scheduled_date: Valid future date
- Symptoms: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Missing required fields" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID32: Create Appointment with Past Date (Abnormal Case)**

**Description:** Tests creating appointment with scheduled date in the past.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists
- Slot exists

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Scheduled_date: Past date (e.g., yesterday)
- Symptoms: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Cannot book appointment in the past" }` or similar
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID33: Create Appointment with Inactive Doctor (Abnormal Case)**

**Description:** Tests creating appointment with inactive doctor.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists but is inactive
- Slot exists

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID (inactive doctor)
- Slot_id: Valid ObjectID
- Scheduled_date: Valid future date
- Symptoms: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Bác sĩ không hoạt động" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID34: Create Appointment with Slot Not Belonging to Doctor (Abnormal Case)**

**Description:** Tests creating appointment where slot does not belong to the specified doctor.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists
- Slot exists but belongs to different doctor

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID (Doctor A)
- Slot_id: Valid ObjectID (belongs to Doctor B)
- Scheduled_date: Valid future date
- Symptoms: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Slot không thuộc về bác sĩ" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID35: Create Appointment with Very Long Symptoms (Boundary Case)**

**Description:** Tests creating appointment with extremely long symptoms text.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Scheduled_date: Valid future date
- Symptoms: `"A".repeat(10000)` (very long string)

**Expected Outcome:**
- Return: `400 Bad Request` or `201 Created` (depending on validation)
- Response: Error if validation limits length, or success if allowed
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID36: Create Appointment with Empty Symptoms (Boundary Case)**

**Description:** Tests creating appointment with empty symptoms field.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Scheduled_date: Valid future date
- Symptoms: `""` or `null`

**Expected Outcome:**
- Return: `400 Bad Request` or `201 Created` (depending on whether symptoms is required)
- Response: Error if required, or success if optional
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID37: Create Appointment Database Connection Error (Abnormal Case)**

**Description:** Tests system behavior when database connection fails.

**Preconditions:**
- Database connection unavailable
- Patient exists (in disconnected database)
- Doctor exists
- Slot exists

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Scheduled_date: Valid future date
- Symptoms: `"Headache"`

**Expected Outcome:**
- Return: `503 Service Unavailable`
- Response: `{ success: false, error: "Service temporarily unavailable" }`
- Appointment should not be created
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID38: Create Appointment with Missing Full Name (Abnormal Case)**

**Description:** Tests creating appointment when full_name is missing (required field).

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `""` or `undefined` *(missing - focus of this test)*
- Phone: `"0123456789"` *(required)*
- Email: `"patient@example.com"` *(required)*
- Scheduled_date: Valid future date
- Reason: `"Headache"`
- *(Other optional fields: can be omitted)*

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Missing required fields" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID39: Create Appointment with Missing Phone (Abnormal Case)**

**Description:** Tests creating appointment when phone is missing (required field).

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `""` or `undefined` (missing)
- Email: `"patient@example.com"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Missing required fields" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID40: Create Appointment with Missing Email (Abnormal Case)**

**Description:** Tests creating appointment when email is missing (required field).

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `""` or `undefined` (missing)
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Missing required fields" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID41: Create Appointment with Invalid Email Format (Abnormal Case)**

**Description:** Tests creating appointment with invalid email format.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"invalid-email-format"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request` or `201 Created` (depending on email validation)
- Response: Error if email validation is strict, or success if email is only validated at service level
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID42: Create Appointment with Invalid Specialty ID (Abnormal Case)**

**Description:** Tests creating appointment with invalid specialty_id format.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Specialty_id: `"invalid-objectid"` *(invalid format - focus of this test)*
- Full_name: `"Nguyen Van A"` *(required)*
- Phone: `"0123456789"` *(required)*
- Email: `"patient@example.com"` *(required)*
- Scheduled_date: Valid future date
- Reason: `"Headache"`
- *(Other optional fields: can be omitted)*

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Invalid specialty_id" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID43: Create Appointment with Invalid Clinic ID (Abnormal Case)**

**Description:** Tests creating appointment with invalid clinic_id format.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Clinic_id: `"invalid-objectid"`
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Invalid clinic_id" }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID44: Create Appointment with Auto-Assign Doctor (Normal Case)**

**Description:** Tests creating appointment with clinic_id and specialty_id, system auto-assigns doctor and slot.

**Preconditions:**
- Can connect with server
- Patient exists
- Clinic exists with active doctors
- At least one doctor in clinic has matching specialty_id
- Available slots exist for the doctor

**Inputs:**
- Patient_id: Valid ObjectID
- Clinic_id: Valid ObjectID
- Specialty_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`
- Doctor_id: (not provided - will be auto-assigned)
- Slot_id: (not provided - will be auto-assigned)

**Expected Outcome:**
- Return: `201 Created`
- Response: `{ success: true, data: { appointment: {...}, auto_assigned_doctor: true, slot_info: {...} } }`
- Appointment created with auto-assigned doctor_id and slot_id
- Doctor and slot match clinic_id and specialty_id
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID45: Create Appointment with Auto-Assign Doctor - No Available Doctor (Abnormal Case)**

**Description:** Tests creating appointment with clinic_id and specialty_id, but no available doctor found.

**Preconditions:**
- Can connect with server
- Patient exists
- Clinic exists but no active doctors with matching specialty_id
- Or no available slots for matching doctors

**Inputs:**
- Patient_id: Valid ObjectID
- Clinic_id: Valid ObjectID
- Specialty_id: Valid ObjectID (no matching doctors)
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`
- Doctor_id: (not provided)
- Slot_id: (not provided)

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Không tìm thấy bác sĩ phù hợp trong phòng khám. Vui lòng chọn bác sĩ cụ thể." }`
- Appointment should not be created
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID46: Create Appointment with Optional Fields - DOB and Gender (Normal Case)**

**Description:** Tests creating appointment with optional fields dob and gender.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `201 Created`
- Response: `{ success: true, data: { appointment: {...} } }`
- Appointment created with dob and gender stored
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID47: Create Appointment with Location Fields (Normal Case)**

**Description:** Tests creating appointment with optional location fields (province_code, ward_code, address_text).

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- Province_code: `"01"`
- Ward_code: `"001"`
- Address_text: `"123 Main Street, District 1"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `201 Created`
- Response: `{ success: true, data: { appointment: {...} } }`
- Appointment created with location fields stored
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID48: Create Appointment with Reason Field (Normal Case)**

**Description:** Tests creating appointment with reason field.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- Scheduled_date: Valid future date
- Reason: `"Persistent headache for 3 days, accompanied by fever"`

**Expected Outcome:**
- Return: `201 Created`
- Response: `{ success: true, data: { appointment: {...} } }`
- Appointment created with reason stored
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID49: Create Appointment with All Optional Fields (Normal Case)**

**Description:** Tests creating appointment with all optional fields filled.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available
- Specialty exists
- Clinic exists

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Specialty_id: Valid ObjectID
- Clinic_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- DOB: `"1990-01-01"`
- Gender: `"MALE"`
- Province_code: `"01"`
- Ward_code: `"001"`
- Address_text: `"123 Main Street"`
- Scheduled_date: Valid future date
- Reason: `"Regular checkup"`

**Expected Outcome:**
- Return: `201 Created`
- Response: `{ success: true, data: { appointment: {...} } }`
- Appointment created with all fields stored correctly
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID50: Create Appointment with Very Long Reason Text (Boundary Case)**

**Description:** Tests creating appointment with extremely long reason text.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- Scheduled_date: Valid future date
- Reason: `"A".repeat(5000)` (very long string)

**Expected Outcome:**
- Return: `400 Bad Request` or `201 Created` (depending on validation)
- Response: Error if validation limits length, or success if allowed
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID51: Create Appointment with Invalid Phone Format (Abnormal Case)**

**Description:** Tests creating appointment with invalid phone number format.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"invalid-phone-format"`
- Email: `"patient@example.com"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request` or `201 Created` (depending on phone validation)
- Response: Error if phone validation is strict, or success if phone is only validated at service level
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID52: Create Appointment with Invalid DOB Format (Abnormal Case)**

**Description:** Tests creating appointment with invalid date of birth format.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- DOB: `"invalid-date-format"`
- Gender: `"MALE"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request` or `201 Created` (depending on DOB validation)
- Response: Error if DOB validation is strict, or success if DOB is only validated at service level
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID53: Create Appointment with Invalid Gender Value (Abnormal Case)**

**Description:** Tests creating appointment with invalid gender value.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"patient@example.com"`
- Gender: `"INVALID_GENDER"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `400 Bad Request` or `201 Created` (depending on gender validation)
- Response: Error if gender validation is strict, or success if gender is only validated at service level
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID54: Create Appointment - Email Notification Success (Normal Case)**

**Description:** Tests that email notification is sent successfully after appointment creation.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available
- Email service is available

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"valid-email@example.com"`
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `201 Created`
- Response: `{ success: true, data: { appointment: {...}, email_sent: true, email_error: null } }`
- Appointment created
- Email sent successfully
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID55: Create Appointment - Email Notification Failure (Boundary Case)**

**Description:** Tests that appointment is still created even if email notification fails.

**Preconditions:**
- Can connect with server
- Patient exists
- Doctor exists and is active
- Slot exists and is available
- Email service is unavailable or email is invalid

**Inputs:**
- Patient_id: Valid ObjectID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Full_name: `"Nguyen Van A"`
- Phone: `"0123456789"`
- Email: `"invalid-email-format"` or email service down
- Scheduled_date: Valid future date
- Reason: `"Headache"`

**Expected Outcome:**
- Return: `201 Created` (appointment should still be created)
- Response: `{ success: true, data: { appointment: {...}, email_sent: false, email_error: "..." } }`
- Appointment created successfully
- Email sending failed but doesn't affect appointment creation
- Exception: (None)
- Log message: Email error logged

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: googleLogin

### Function Details
- **Function Name:** `googleLogin`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** ~62 lines (13-74)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 12
- **Passed:** 0
- **Failed:** 0
- **Untested:** 12
- **N/A/B:** 0

---

### **UTCID56: Successful Google Login - New User (Normal Case)**

**Description:** Tests successful Google login for a new user (first time login).

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly
- Valid Google ID token provided
- User does not exist in database

**Inputs:**
- id_token: Valid Google ID token (JWT)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, account: {...}, user: {...}, patient: {...}, tokens: {...} }`
- New account created with Google email
- User record created
- Patient record created (if role is PATIENT)
- Access token and refresh token generated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID57: Successful Google Login - Existing User (Normal Case)**

**Description:** Tests successful Google login for an existing user.

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly
- Valid Google ID token provided
- User already exists in database with same email

**Inputs:**
- id_token: Valid Google ID token (JWT) for existing user

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, account: {...}, user: {...}, patient: {...}, tokens: {...} }`
- Existing account found and used
- Access token and refresh token generated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID58: Google Login with Missing ID Token (Abnormal Case)**

**Description:** Tests Google login when id_token is missing.

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly

**Inputs:**
- id_token: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Thiếu thông tin xác thực từ Google" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID59: Google Login with Invalid ID Token (Abnormal Case)**

**Description:** Tests Google login with invalid or malformed ID token.

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly

**Inputs:**
- id_token: `"invalid-token-string"` or malformed JWT

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token xác thực Google không hợp lệ" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID60: Google Login with Expired Token (Abnormal Case)**

**Description:** Tests Google login with expired Google ID token.

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly
- Expired Google ID token provided

**Inputs:**
- id_token: Expired Google ID token (JWT)

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token đã hết hạn. Vui lòng thử lại." }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID61: Google Login with Wrong Client ID (Abnormal Case)**

**Description:** Tests Google login with token from different OAuth client.

**Preconditions:**
- Can connect with server
- Google OAuth is configured with specific Client ID
- Valid token from different Client ID provided

**Inputs:**
- id_token: Valid Google ID token but from different Client ID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ ok: false, message: "Cấu hình Google OAuth không đúng. Vui lòng liên hệ quản trị viên." }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID62: Google Login with Unverified Email (Boundary Case)**

**Description:** Tests Google login when Google email is not verified.

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly
- Valid Google ID token with unverified email

**Inputs:**
- id_token: Valid Google ID token with email_verified: false

**Expected Outcome:**
- Return: `400 Bad Request` or `200 OK` (depending on implementation)
- Response: Error message if email verification required, or success if allowed
- Exception: (Depends on implementation)
- Log message: (Depends on implementation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID63: Google Login - Account Creation Failure (Abnormal Case)**

**Description:** Tests Google login when account creation fails.

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly
- Valid Google ID token provided
- Database error occurs during account creation

**Inputs:**
- id_token: Valid Google ID token

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ ok: false, message: "Không thể tạo tài khoản. Vui lòng thử lại." }`
- Exception: Database error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID64: Google Login with SQL Injection in Token (Security Test)**

**Description:** Tests Google login with malicious payload in token.

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly

**Inputs:**
- id_token: Token containing SQL injection attempt or XSS payload

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token xác thực Google không hợp lệ" }`
- System should safely reject malicious token
- Exception: (None, should be handled safely)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID65: Google Login - Network Timeout (Abnormal Case)**

**Description:** Tests Google login when Google verification service times out.

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly
- Network timeout when verifying token with Google

**Inputs:**
- id_token: Valid Google ID token

**Expected Outcome:**
- Return: `400 Bad Request` or `503 Service Unavailable`
- Response: `{ ok: false, message: "Google login thất bại" }`
- Exception: Network timeout error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID66: Google Login with Empty Request Body (Abnormal Case)**

**Description:** Tests Google login with empty request body.

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly

**Inputs:**
- Request body: `{}` (empty)

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Thiếu thông tin xác thực từ Google" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID67: Google Login - Token Verification Service Down (Abnormal Case)**

**Description:** Tests Google login when Google token verification service is unavailable.

**Preconditions:**
- Can connect with server
- Google OAuth is configured correctly
- Google token verification service is down

**Inputs:**
- id_token: Valid Google ID token

**Expected Outcome:**
- Return: `400 Bad Request` or `503 Service Unavailable`
- Response: `{ ok: false, message: "Google login thất bại" }`
- Exception: Service unavailable error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: verifyEmail

### Function Details
- **Function Name:** `verifyEmail`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** ~10 lines (178-188)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID68: Successful Email Verification (Normal Case)**

**Description:** Tests successful email verification with valid token and account ID.

**Preconditions:**
- Can connect with server
- Account exists in database
- Valid verification token exists for account
- Token has not expired

**Inputs:**
- token: Valid email verification token
- account_id: Valid account ID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, message: "Email đã được xác minh thành công" }`
- Account email_verified field set to true
- Verification token invalidated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID69: Email Verification with Invalid Token (Abnormal Case)**

**Description:** Tests email verification with invalid or non-existent token.

**Preconditions:**
- Can connect with server
- Account exists in database

**Inputs:**
- token: `"invalid-token"` or non-existent token
- account_id: Valid account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token xác minh không hợp lệ" }`
- Account email_verified remains false
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID70: Email Verification with Expired Token (Abnormal Case)**

**Description:** Tests email verification with expired token.

**Preconditions:**
- Can connect with server
- Account exists in database
- Expired verification token exists

**Inputs:**
- token: Expired verification token
- account_id: Valid account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token đã hết hạn" }`
- Account email_verified remains false
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID71: Email Verification with Missing Token (Abnormal Case)**

**Description:** Tests email verification when token is missing.

**Preconditions:**
- Can connect with server
- Account exists in database

**Inputs:**
- token: `undefined` or `null` or `""`
- account_id: Valid account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token là bắt buộc" }`
- Account email_verified remains false
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID72: Email Verification with Missing Account ID (Abnormal Case)**

**Description:** Tests email verification when account_id is missing.

**Preconditions:**
- Can connect with server

**Inputs:**
- token: Valid verification token
- account_id: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Account ID là bắt buộc" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID73: Email Verification with Invalid Account ID (Abnormal Case)**

**Description:** Tests email verification with non-existent account ID.

**Preconditions:**
- Can connect with server
- Account does not exist

**Inputs:**
- token: Valid verification token
- account_id: Non-existent account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Account không tồn tại" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID74: Email Verification - Already Verified (Boundary Case)**

**Description:** Tests email verification when email is already verified.

**Preconditions:**
- Can connect with server
- Account exists in database
- Account email_verified is already true

**Inputs:**
- token: Valid verification token (may be invalidated)
- account_id: Valid account ID

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on implementation)
- Response: Success message or "Email đã được xác minh trước đó"
- Exception: (None)
- Log message: (Depends on implementation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID75: Email Verification with Token Mismatch (Abnormal Case)**

**Description:** Tests email verification when token does not match account.

**Preconditions:**
- Can connect with server
- Account A exists with token A
- Account B exists with token B

**Inputs:**
- token: Token from Account A
- account_id: Account B ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token không khớp với account" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: refresh

### Function Details
- **Function Name:** `refresh`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** ~15 lines (214-229)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID76: Successful Token Refresh (Normal Case)**

**Description:** Tests successful refresh of access token using valid refresh token.

**Preconditions:**
- Can connect with server
- User is logged in
- Valid refresh token exists
- Refresh token has not expired

**Inputs:**
- refreshToken: Valid refresh token

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, accessToken: "...", refreshToken: "...", refreshExpiresAt: "..." }`
- New access token generated
- New refresh token generated (or same token extended)
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID77: Token Refresh with Missing Refresh Token (Abnormal Case)**

**Description:** Tests token refresh when refresh token is missing.

**Preconditions:**
- Can connect with server

**Inputs:**
- refreshToken: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ ok: false, message: "Refresh token is required" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID78: Token Refresh with Invalid Refresh Token (Abnormal Case)**

**Description:** Tests token refresh with invalid or malformed refresh token.

**Preconditions:**
- Can connect with server

**Inputs:**
- refreshToken: `"invalid-token-string"` or malformed JWT

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ ok: false, message: "Invalid refresh token" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID79: Token Refresh with Expired Refresh Token (Abnormal Case)**

**Description:** Tests token refresh with expired refresh token.

**Preconditions:**
- Can connect with server
- Expired refresh token exists

**Inputs:**
- refreshToken: Expired refresh token

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ ok: false, message: "Refresh token has expired" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID80: Token Refresh with Revoked Refresh Token (Abnormal Case)**

**Description:** Tests token refresh with revoked refresh token (e.g., after logout).

**Preconditions:**
- Can connect with server
- Refresh token exists but has been revoked/logged out

**Inputs:**
- refreshToken: Revoked refresh token

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ ok: false, message: "Refresh token has been revoked" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID81: Token Refresh with Token from Different User (Security Test)**

**Description:** Tests token refresh with refresh token belonging to different user.

**Preconditions:**
- Can connect with server
- User A has valid refresh token
- User B attempts to use User A's refresh token

**Inputs:**
- refreshToken: Refresh token from User A (used by User B)

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ ok: false, message: "Invalid refresh token" }`
- System should reject token from different user
- Exception: (None)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID82: Token Refresh - Database Connection Error (Abnormal Case)**

**Description:** Tests token refresh when database connection fails.

**Preconditions:**
- Database connection unavailable
- Valid refresh token exists (in disconnected database)

**Inputs:**
- refreshToken: Valid refresh token

**Expected Outcome:**
- Return: `503 Service Unavailable` or `500 Internal Server Error`
- Response: `{ ok: false, message: "Service temporarily unavailable" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID83: Token Refresh with Tampered Token (Security Test)**

**Description:** Tests token refresh with tampered refresh token (signature modified).

**Preconditions:**
- Can connect with server

**Inputs:**
- refreshToken: Valid refresh token with modified signature

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ ok: false, message: "Invalid refresh token" }`
- System should detect tampering
- Exception: (None)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: logout

### Function Details
- **Function Name:** `logout`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** ~8 lines (231-239)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID84: Successful Logout (Normal Case)**

**Description:** Tests successful logout with valid refresh token.

**Preconditions:**
- Can connect with server
- User is logged in
- Valid refresh token exists

**Inputs:**
- refreshToken: Valid refresh token

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, message: "Đăng xuất thành công" }`
- Refresh token revoked/invalidated
- Session terminated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID85: Logout with Missing Refresh Token (Abnormal Case)**

**Description:** Tests logout when refresh token is missing.

**Preconditions:**
- Can connect with server

**Inputs:**
- refreshToken: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Refresh token is required" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID86: Logout with Invalid Refresh Token (Abnormal Case)**

**Description:** Tests logout with invalid refresh token.

**Preconditions:**
- Can connect with server

**Inputs:**
- refreshToken: `"invalid-token-string"` or non-existent token

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Invalid refresh token" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID87: Logout with Already Revoked Token (Boundary Case)**

**Description:** Tests logout when refresh token is already revoked.

**Preconditions:**
- Can connect with server
- Refresh token exists but already revoked

**Inputs:**
- refreshToken: Already revoked refresh token

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on implementation)
- Response: Success message or "Token already revoked"
- Exception: (None)
- Log message: (Depends on implementation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID88: Logout - Database Connection Error (Abnormal Case)**

**Description:** Tests logout when database connection fails.

**Preconditions:**
- Database connection unavailable
- Valid refresh token exists (in disconnected database)

**Inputs:**
- refreshToken: Valid refresh token

**Expected Outcome:**
- Return: `503 Service Unavailable` or `500 Internal Server Error`
- Response: `{ ok: false, message: "Service temporarily unavailable" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID89: Logout Multiple Times (Boundary Case)**

**Description:** Tests logging out multiple times with same token.

**Preconditions:**
- Can connect with server
- User is logged in
- Valid refresh token exists

**Inputs:**
- refreshToken: Valid refresh token (used multiple times)

**Expected Outcome:**
- First logout: `200 OK`
- Subsequent logouts: `200 OK` or `400 Bad Request` (depending on implementation)
- Response: Success message or "Token already revoked"
- Exception: (None)
- Log message: (Depends on implementation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: requestVerifyEmail

### Function Details
- **Function Name:** `requestVerifyEmail`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** ~8 lines (241-249)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID90: Successful Request Email Verification (Normal Case)**

**Description:** Tests successful request for email verification resend.

**Preconditions:**
- Can connect with server
- User is authenticated (JWT token valid)
- Account exists
- Email is not yet verified

**Inputs:**
- JWT token in Authorization header (req.user.sub contains account ID)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, message: "Email xác minh đã được gửi" }`
- New verification token generated
- Verification email sent
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID91: Request Email Verification - Unauthorized (Abnormal Case)**

**Description:** Tests request email verification without authentication.

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

### **UTCID92: Request Email Verification - Already Verified (Boundary Case)**

**Description:** Tests request email verification when email is already verified.

**Preconditions:**
- Can connect with server
- User is authenticated
- Account exists
- Email is already verified

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on implementation)
- Response: Success message or "Email đã được xác minh"
- Exception: (None)
- Log message: (Depends on implementation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID93: Request Email Verification - Account Not Found (Abnormal Case)**

**Description:** Tests request email verification when account does not exist.

**Preconditions:**
- Can connect with server
- User is authenticated
- Account does not exist (deleted)

**Inputs:**
- JWT token in Authorization header with non-existent account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Account not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID94: Request Email Verification - Email Service Error (Abnormal Case)**

**Description:** Tests request email verification when email service fails.

**Preconditions:**
- Can connect with server
- User is authenticated
- Account exists
- Email service is unavailable

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error` or `200 OK` (depending on implementation)
- Response: Error message or success (if email failure doesn't block request)
- Exception: Email service error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID95: Request Email Verification - Rate Limiting (Boundary Case)**

**Description:** Tests request email verification multiple times in short period.

**Preconditions:**
- Can connect with server
- User is authenticated
- Account exists
- Rate limiting is implemented

**Inputs:**
- JWT token in Authorization header (used multiple times rapidly)

**Expected Outcome:**
- First few requests: `200 OK`
- After rate limit: `429 Too Many Requests` or `400 Bad Request`
- Response: Rate limit error message
- Exception: (None)
- Log message: May log rate limit attempt

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: requestPasswordReset

### Function Details
- **Function Name:** `requestPasswordReset`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** ~8 lines (251-259)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID96: Successful Password Reset Request (Normal Case)**

**Description:** Tests successful request for password reset with valid email.

**Preconditions:**
- Can connect with server
- Account exists with email
- Email service is available

**Inputs:**
- email: `"user@example.com"` (existing account)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, message: "Email đặt lại mật khẩu đã được gửi" }`
- Password reset token generated
- Reset email sent to account email
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID97: Password Reset Request with Non-Existent Email (Abnormal Case)**

**Description:** Tests password reset request with email that doesn't exist (security: don't reveal if email exists).

**Preconditions:**
- Can connect with server
- Email does not exist in database

**Inputs:**
- email: `"nonexistent@example.com"`

**Expected Outcome:**
- Return: `200 OK` (for security, don't reveal if email exists)
- Response: `{ ok: true, message: "Email đặt lại mật khẩu đã được gửi" }` (same message)
- No email sent
- No token generated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID98: Password Reset Request with Missing Email (Abnormal Case)**

**Description:** Tests password reset request when email is missing.

**Preconditions:**
- Can connect with server

**Inputs:**
- email: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Email is required" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID99: Password Reset Request with Invalid Email Format (Abnormal Case)**

**Description:** Tests password reset request with invalid email format.

**Preconditions:**
- Can connect with server

**Inputs:**
- email: `"invalid-email-format"`

**Expected Outcome:**
- Return: `400 Bad Request` or `200 OK` (depending on validation)
- Response: Error message if validation strict, or success if validated at service level
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID100: Password Reset Request - Email Service Error (Abnormal Case)**

**Description:** Tests password reset request when email service fails.

**Preconditions:**
- Can connect with server
- Account exists
- Email service is unavailable

**Inputs:**
- email: `"user@example.com"` (existing account)

**Expected Outcome:**
- Return: `500 Internal Server Error` or `200 OK` (depending on implementation)
- Response: Error message or success (if email failure doesn't block request)
- Exception: Email service error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID101: Password Reset Request - Rate Limiting (Security Test)**

**Description:** Tests password reset request multiple times in short period (prevent abuse).

**Preconditions:**
- Can connect with server
- Account exists
- Rate limiting is implemented

**Inputs:**
- email: `"user@example.com"` (used multiple times rapidly)

**Expected Outcome:**
- First few requests: `200 OK`
- After rate limit: `429 Too Many Requests` or `400 Bad Request`
- Response: Rate limit error message
- Exception: (None)
- Log message: May log rate limit attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID102: Password Reset Request with SQL Injection (Security Test)**

**Description:** Tests password reset request with SQL injection attempt in email.

**Preconditions:**
- Can connect with server

**Inputs:**
- email: `"test'; DROP TABLE users; --@example.com"`

**Expected Outcome:**
- Return: `400 Bad Request` or `200 OK` (should be sanitized)
- Response: Should handle safely without executing SQL
- Exception: (None, should be handled safely)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID103: Password Reset Request with Very Long Email (Boundary Case)**

**Description:** Tests password reset request with extremely long email.

**Preconditions:**
- Can connect with server

**Inputs:**
- email: `"a".repeat(250) + "@example.com"` (very long email)

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Invalid email format" }`
- Exception: Validation error
- Log message: Error log

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: resetPassword

### Function Details
- **Function Name:** `resetPassword`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** ~8 lines (261-269)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID104: Successful Password Reset (Normal Case)**

**Description:** Tests successful password reset with valid token and new password.

**Preconditions:**
- Can connect with server
- Account exists
- Valid password reset token exists
- Token has not expired

**Inputs:**
- token: Valid password reset token
- newPassword: `"NewValidPass123!@#"`
- accountId: Valid account ID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, message: "Mật khẩu đã được đặt lại thành công" }`
- Account password updated
- Reset token invalidated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID105: Password Reset with Invalid Token (Abnormal Case)**

**Description:** Tests password reset with invalid or non-existent token.

**Preconditions:**
- Can connect with server
- Account exists

**Inputs:**
- token: `"invalid-token"` or non-existent token
- newPassword: `"NewValidPass123!@#"`
- accountId: Valid account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token đặt lại mật khẩu không hợp lệ" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID106: Password Reset with Expired Token (Abnormal Case)**

**Description:** Tests password reset with expired token.

**Preconditions:**
- Can connect with server
- Account exists
- Expired password reset token exists

**Inputs:**
- token: Expired password reset token
- newPassword: `"NewValidPass123!@#"`
- accountId: Valid account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token đã hết hạn" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID107: Password Reset with Missing Token (Abnormal Case)**

**Description:** Tests password reset when token is missing.

**Preconditions:**
- Can connect with server
- Account exists

**Inputs:**
- token: `undefined` or `null` or `""`
- newPassword: `"NewValidPass123!@#"`
- accountId: Valid account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token là bắt buộc" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID108: Password Reset with Missing New Password (Abnormal Case)**

**Description:** Tests password reset when new password is missing.

**Preconditions:**
- Can connect with server
- Account exists
- Valid password reset token exists

**Inputs:**
- token: Valid password reset token
- newPassword: `undefined` or `null` or `""`
- accountId: Valid account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "New password is required" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID109: Password Reset with Weak New Password (Abnormal Case)**

**Description:** Tests password reset with weak new password (doesn't meet requirements).

**Preconditions:**
- Can connect with server
- Account exists
- Valid password reset token exists

**Inputs:**
- token: Valid password reset token
- newPassword: `"weak"` (too short, no uppercase/special)
- accountId: Valid account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Mật khẩu không đáp ứng yêu cầu" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID110: Password Reset with Token Mismatch (Abnormal Case)**

**Description:** Tests password reset when token does not match account.

**Preconditions:**
- Can connect with server
- Account A exists with token A
- Account B exists with token B

**Inputs:**
- token: Token from Account A
- newPassword: `"NewValidPass123!@#"`
- accountId: Account B ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token không khớp với account" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID111: Password Reset with Invalid Account ID (Abnormal Case)**

**Description:** Tests password reset with non-existent account ID.

**Preconditions:**
- Can connect with server
- Account does not exist

**Inputs:**
- token: Valid password reset token
- newPassword: `"NewValidPass123!@#"`
- accountId: Non-existent account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Account không tồn tại" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID112: Password Reset - Already Used Token (Boundary Case)**

**Description:** Tests password reset with token that has already been used.

**Preconditions:**
- Can connect with server
- Account exists
- Password reset token exists but already used

**Inputs:**
- token: Already used password reset token
- newPassword: `"NewValidPass123!@#"`
- accountId: Valid account ID

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Token đã được sử dụng" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID113: Password Reset - Database Connection Error (Abnormal Case)**

**Description:** Tests password reset when database connection fails.

**Preconditions:**
- Database connection unavailable
- Account exists (in disconnected database)
- Valid password reset token exists

**Inputs:**
- token: Valid password reset token
- newPassword: `"NewValidPass123!@#"`
- accountId: Valid account ID

**Expected Outcome:**
- Return: `503 Service Unavailable` or `500 Internal Server Error`
- Response: `{ ok: false, message: "Service temporarily unavailable" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: changePassword

### Function Details
- **Function Name:** `changePassword`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** ~24 lines (271-295)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID114: Successful Password Change (Normal Case)**

**Description:** Tests successful password change with correct current password.

**Preconditions:**
- Can connect with server
- User is authenticated (JWT token valid)
- Account exists
- Current password is known

**Inputs:**
- JWT token in Authorization header
- currentPassword: `"CurrentPass123!@#"`
- newPassword: `"NewValidPass123!@#"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, message: "Mật khẩu đã được thay đổi thành công" }`
- Account password updated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID115: Password Change - Unauthorized (Abnormal Case)**

**Description:** Tests password change without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- currentPassword: `"CurrentPass123!@#"`
- newPassword: `"NewValidPass123!@#"`

**Expected Outcome:**
- Return: `401 Unauthorized`
- Response: `{ ok: false, message: "Unauthorized" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID116: Password Change with Wrong Current Password (Abnormal Case)**

**Description:** Tests password change with incorrect current password.

**Preconditions:**
- Can connect with server
- User is authenticated
- Account exists

**Inputs:**
- JWT token in Authorization header
- currentPassword: `"WrongPassword123"`
- newPassword: `"NewValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Mật khẩu hiện tại không đúng" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID117: Password Change with Missing Current Password (Abnormal Case)**

**Description:** Tests password change when current password is missing.

**Preconditions:**
- Can connect with server
- User is authenticated
- Account exists

**Inputs:**
- JWT token in Authorization header
- currentPassword: `undefined` or `null` or `""`
- newPassword: `"NewValidPass123!@#"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Missing fields" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID118: Password Change with Missing New Password (Abnormal Case)**

**Description:** Tests password change when new password is missing.

**Preconditions:**
- Can connect with server
- User is authenticated
- Account exists

**Inputs:**
- JWT token in Authorization header
- currentPassword: `"CurrentPass123!@#"`
- newPassword: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Missing fields" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID119: Password Change with Weak New Password (Abnormal Case)**

**Description:** Tests password change with weak new password (doesn't meet requirements).

**Preconditions:**
- Can connect with server
- User is authenticated
- Account exists

**Inputs:**
- JWT token in Authorization header
- currentPassword: `"CurrentPass123!@#"`
- newPassword: `"weak"` (too short, no uppercase/special)

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ ok: false, message: "Mật khẩu không đáp ứng yêu cầu" }`
- Account password not updated
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID120: Password Change with Same Password (Boundary Case)**

**Description:** Tests password change when new password is same as current password.

**Preconditions:**
- Can connect with server
- User is authenticated
- Account exists
- Current password is "CurrentPass123!@#"

**Inputs:**
- JWT token in Authorization header
- currentPassword: `"CurrentPass123!@#"`
- newPassword: `"CurrentPass123!@#"` (same as current)

**Expected Outcome:**
- Return: `400 Bad Request` or `200 OK` (depending on implementation)
- Response: Error message if same password not allowed, or success if allowed
- Exception: (Depends on implementation)
- Log message: (Depends on implementation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID121: Password Change - Account Not Found (Abnormal Case)**

**Description:** Tests password change when account does not exist.

**Preconditions:**
- Can connect with server
- User is authenticated
- Account does not exist (deleted)

**Inputs:**
- JWT token in Authorization header with non-existent account ID
- currentPassword: `"CurrentPass123!@#"`
- newPassword: `"NewValidPass123!@#"`

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ ok: false, message: "Account not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID122: Password Change - Database Connection Error (Abnormal Case)**

**Description:** Tests password change when database connection fails.

**Preconditions:**
- Database connection unavailable
- User is authenticated
- Account exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- currentPassword: `"CurrentPass123!@#"`
- newPassword: `"NewValidPass123!@#"`

**Expected Outcome:**
- Return: `503 Service Unavailable` or `500 Internal Server Error`
- Response: `{ ok: false, message: "Server error" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID123: Password Change with Special Characters (Boundary Case)**

**Description:** Tests password change with new password containing special characters.

**Preconditions:**
- Can connect with server
- User is authenticated
- Account exists

**Inputs:**
- JWT token in Authorization header
- currentPassword: `"CurrentPass123!@#"`
- newPassword: `"P@ssw0rd!@#$%^&*()"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ ok: true, message: "Mật khẩu đã được thay đổi thành công" }`
- Account password updated successfully
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: getById (Appointment)

### Function Details
- **Function Name:** `getById`
- **File:** `backend/src/controller/appoinment/appointment.controller.js`
- **Lines of code:** ~7 lines (39-46)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID124: Get Appointment by Valid ID (Normal Case)**

**Description:** Tests successful retrieval of appointment by valid ID.

**Preconditions:**
- Can connect with server
- Appointment exists in database

**Inputs:**
- id: Valid appointment ObjectID (from req.params.id)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointment: {...} } }`
- Appointment details returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID125: Get Appointment with Invalid ID Format (Abnormal Case)**

**Description:** Tests getting appointment with invalid ID format.

**Preconditions:**
- Can connect with server

**Inputs:**
- id: `"invalid-id-format"` (not a valid ObjectID)

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

### **UTCID126: Get Appointment with Non-Existent ID (Abnormal Case)**

**Description:** Tests getting appointment with valid ObjectID format but non-existent ID.

**Preconditions:**
- Can connect with server
- Appointment does not exist

**Inputs:**
- id: Valid ObjectID format but non-existent appointment ID

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

### **UTCID127: Get Appointment with Missing ID (Abnormal Case)**

**Description:** Tests getting appointment when ID is missing.

**Preconditions:**
- Can connect with server

**Inputs:**
- id: `undefined` or `null` or `""`

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

### **UTCID128: Get Appointment - Database Connection Error (Abnormal Case)**

**Description:** Tests getting appointment when database connection fails.

**Preconditions:**
- Database connection unavailable
- Appointment exists (in disconnected database)

**Inputs:**
- id: Valid appointment ObjectID

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

### **UTCID129: Get Appointment with SQL Injection in ID (Security Test)**

**Description:** Tests getting appointment with SQL injection attempt in ID parameter.

**Preconditions:**
- Can connect with server

**Inputs:**
- id: `"'; DROP TABLE appointments; --"`

**Expected Outcome:**
- Return: `404 Not Found` (should be safely handled)
- Response: `{ success: false, error: "Appointment not found" }`
- System should safely reject malicious input
- Exception: (None, should be handled safely)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: getByPatient (Appointment)

### Function Details
- **Function Name:** `getByPatient`
- **File:** `backend/src/controller/appoinment/appointment.controller.js`
- **Lines of code:** ~19 lines (48-68)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID130: Get Appointments by Valid Patient ID (Normal Case)**

**Description:** Tests successful retrieval of appointments for valid patient ID.

**Preconditions:**
- Can connect with server
- Patient exists
- Patient has appointments in database

**Inputs:**
- patientId: Valid patient ObjectID
- status: (optional) `"SCHEDULED"` or `"COMPLETED"` or `"CANCELLED"`
- page: (optional) `1`
- limit: (optional) `10`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [...], pagination: {...} } }`
- Appointments list returned
- Pagination info included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID131: Get Appointments with Invalid Patient ID Format (Abnormal Case)**

**Description:** Tests getting appointments with invalid patient ID format.

**Preconditions:**
- Can connect with server

**Inputs:**
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

### **UTCID132: Get Appointments with Non-Existent Patient ID (Abnormal Case)**

**Description:** Tests getting appointments for non-existent patient.

**Preconditions:**
- Can connect with server
- Patient does not exist

**Inputs:**
- patientId: Valid ObjectID format but non-existent patient ID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [], pagination: {...} } }`
- Empty appointments list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID133: Get Appointments with Status Filter (Normal Case)**

**Description:** Tests getting appointments filtered by status.

**Preconditions:**
- Can connect with server
- Patient exists
- Patient has appointments with different statuses

**Inputs:**
- patientId: Valid patient ObjectID
- status: `"SCHEDULED"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [...], pagination: {...} } }`
- Only appointments with status "SCHEDULED" returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID134: Get Appointments with Pagination (Normal Case)**

**Description:** Tests getting appointments with pagination parameters.

**Preconditions:**
- Can connect with server
- Patient exists
- Patient has more than 10 appointments

**Inputs:**
- patientId: Valid patient ObjectID
- page: `2`
- limit: `5`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [...], pagination: { page: 2, limit: 5, total: ... } } }`
- Only 5 appointments returned (page 2)
- Pagination info correct
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID135: Get Appointments with Invalid Status (Abnormal Case)**

**Description:** Tests getting appointments with invalid status value.

**Preconditions:**
- Can connect with server
- Patient exists

**Inputs:**
- patientId: Valid patient ObjectID
- status: `"INVALID_STATUS"`

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on validation)
- Response: All appointments or error message
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID136: Get Appointments with Negative Page Number (Boundary Case)**

**Description:** Tests getting appointments with negative page number.

**Preconditions:**
- Can connect with server
- Patient exists

**Inputs:**
- patientId: Valid patient ObjectID
- page: `-1`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [...], pagination: { page: 1, ... } } }`
- Page defaults to 1
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID137: Get Appointments with Zero Limit (Boundary Case)**

**Description:** Tests getting appointments with zero limit.

**Preconditions:**
- Can connect with server
- Patient exists

**Inputs:**
- patientId: Valid patient ObjectID
- limit: `0`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { appointments: [...], pagination: { limit: 10, ... } } }`
- Limit defaults to 10
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID138: Get Appointments with Very Large Limit (Boundary Case)**

**Description:** Tests getting appointments with very large limit value.

**Preconditions:**
- Can connect with server
- Patient exists

**Inputs:**
- patientId: Valid patient ObjectID
- limit: `10000`

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on max limit)
- Response: All appointments or error if max limit enforced
- Exception: (Depends on validation)
- Log message: (Depends on validation)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID139: Get Appointments - Database Connection Error (Abnormal Case)**

**Description:** Tests getting appointments when database connection fails.

**Preconditions:**
- Database connection unavailable
- Patient exists (in disconnected database)

**Inputs:**
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

## 🧪 TEST CASES CHO FUNCTION: getAvailableSlots (Appointment)

### Function Details
- **Function Name:** `getAvailableSlots`
- **File:** `backend/src/controller/appoinment/appointment.controller.js`
- **Lines of code:** ~22 lines (73-95)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID140: Get Available Slots Successfully (Normal Case)**

**Description:** Tests successful retrieval of available slots for doctor on specific date.

**Preconditions:**
- Can connect with server
- Doctor exists
- Doctor has slots configured
- Date is valid future date

**Inputs:**
- doctorId: Valid doctor ObjectID
- date: `"2024-12-25"` (valid date string)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { slots: [...] } }`
- Available slots list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID141: Get Available Slots with Invalid Doctor ID Format (Abnormal Case)**

**Description:** Tests getting available slots with invalid doctor ID format.

**Preconditions:**
- Can connect with server

**Inputs:**
- doctorId: `"invalid-id-format"` (not a valid ObjectID)
- date: `"2024-12-25"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Invalid doctorId ObjectId." }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID142: Get Available Slots with Missing Date (Abnormal Case)**

**Description:** Tests getting available slots when date parameter is missing.

**Preconditions:**
- Can connect with server
- Doctor exists

**Inputs:**
- doctorId: Valid doctor ObjectID
- date: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Date parameter is required" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID143: Get Available Slots with Invalid Date Format (Abnormal Case)**

**Description:** Tests getting available slots with invalid date format.

**Preconditions:**
- Can connect with server
- Doctor exists

**Inputs:**
- doctorId: Valid doctor ObjectID
- date: `"invalid-date-format"`

**Expected Outcome:**
- Return: `400 Bad Request` or `200 OK` (depending on date parsing)
- Response: Error message or empty slots list
- Exception: (Depends on date parsing)
- Log message: (Depends on date parsing)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID144: Get Available Slots with Past Date (Boundary Case)**

**Description:** Tests getting available slots for past date.

**Preconditions:**
- Can connect with server
- Doctor exists

**Inputs:**
- doctorId: Valid doctor ObjectID
- date: `"2020-01-01"` (past date)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { slots: [] } }` (empty list for past date)
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID145: Get Available Slots with Non-Existent Doctor (Abnormal Case)**

**Description:** Tests getting available slots for non-existent doctor.

**Preconditions:**
- Can connect with server
- Doctor does not exist

**Inputs:**
- doctorId: Valid ObjectID format but non-existent doctor ID
- date: `"2024-12-25"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { slots: [] } }` (empty list)
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID146: Get Available Slots - No Slots Configured (Normal Case)**

**Description:** Tests getting available slots when doctor has no slots configured.

**Preconditions:**
- Can connect with server
- Doctor exists
- Doctor has no slots configured

**Inputs:**
- doctorId: Valid doctor ObjectID
- date: `"2024-12-25"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { slots: [] } }`
- Empty slots list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID147: Get Available Slots - Database Connection Error (Abnormal Case)**

**Description:** Tests getting available slots when database connection fails.

**Preconditions:**
- Database connection unavailable
- Doctor exists (in disconnected database)

**Inputs:**
- doctorId: Valid doctor ObjectID
- date: `"2024-12-25"`

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

## 🧪 TEST CASES CHO FUNCTION: checkSlotAvailability (Appointment)

### Function Details
- **Function Name:** `checkSlotAvailability`
- **File:** `backend/src/controller/appoinment/appointment.controller.js`
- **Lines of code:** ~44 lines (100-143)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID148: Check Slot Availability - Available (Normal Case)**

**Description:** Tests checking slot availability when slot is available.

**Preconditions:**
- Can connect with server
- Slot exists
- Slot is not full
- Scheduled date is valid

**Inputs:**
- slotId: Valid slot ObjectID
- scheduledDate: `"2024-12-25"` (valid future date)
- patientId: (optional) Valid patient ObjectID

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { canBook: true, reason: null, bookedCount: X, maxPatients: Y, remainingSlots: Z } }`
- Slot is available for booking
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID149: Check Slot Availability - Full (Normal Case)**

**Description:** Tests checking slot availability when slot is full.

**Preconditions:**
- Can connect with server
- Slot exists
- Slot is full (bookedCount >= maxPatients)

**Inputs:**
- slotId: Valid slot ObjectID (full slot)
- scheduledDate: `"2024-12-25"`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { canBook: false, reason: "Slot is full", bookedCount: Y, maxPatients: Y, remainingSlots: 0 } }`
- Slot is not available
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID150: Check Slot Availability with Invalid Slot ID (Abnormal Case)**

**Description:** Tests checking slot availability with invalid slot ID format.

**Preconditions:**
- Can connect with server

**Inputs:**
- slotId: `"invalid-id-format"` (not a valid ObjectID)
- scheduledDate: `"2024-12-25"`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "Invalid slotId ObjectId." }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID151: Check Slot Availability with Missing Scheduled Date (Abnormal Case)**

**Description:** Tests checking slot availability when scheduled date is missing.

**Preconditions:**
- Can connect with server
- Slot exists

**Inputs:**
- slotId: Valid slot ObjectID
- scheduledDate: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `400 Bad Request`
- Response: `{ success: false, error: "scheduledDate parameter is required" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID152: Check Slot Availability - Patient Already Has Appointment (Normal Case)**

**Description:** Tests checking slot availability when patient already has appointment in this slot.

**Preconditions:**
- Can connect with server
- Slot exists
- Patient exists
- Patient already has appointment in this slot for the date

**Inputs:**
- slotId: Valid slot ObjectID
- scheduledDate: `"2024-12-25"`
- patientId: Valid patient ObjectID (with existing appointment)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { canBook: false, reason: "Patient already has an appointment in this slot", ... } }`
- Slot is not available for this patient
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID153: Check Slot Availability with Invalid Patient ID (Abnormal Case)**

**Description:** Tests checking slot availability with invalid patient ID format.

**Preconditions:**
- Can connect with server
- Slot exists

**Inputs:**
- slotId: Valid slot ObjectID
- scheduledDate: `"2024-12-25"`
- patientId: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `200 OK` (patientId validation may be optional)
- Response: `{ success: true, data: { canBook: true, ... } }` (patientId check skipped)
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID154: Check Slot Availability with Non-Existent Slot (Abnormal Case)**

**Description:** Tests checking slot availability for non-existent slot.

**Preconditions:**
- Can connect with server
- Slot does not exist

**Inputs:**
- slotId: Valid ObjectID format but non-existent slot ID
- scheduledDate: `"2024-12-25"`

**Expected Outcome:**
- Return: `200 OK` or `404 Not Found` (depending on implementation)
- Response: Error message or empty result
- Exception: (Depends on implementation)
- Log message: (Depends on implementation)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID155: Check Slot Availability with Past Date (Boundary Case)**

**Description:** Tests checking slot availability for past date.

**Preconditions:**
- Can connect with server
- Slot exists

**Inputs:**
- slotId: Valid slot ObjectID
- scheduledDate: `"2020-01-01"` (past date)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { canBook: false, reason: "Cannot book in the past", ... } }` or similar
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID156: Check Slot Availability - Database Connection Error (Abnormal Case)**

**Description:** Tests checking slot availability when database connection fails.

**Preconditions:**
- Database connection unavailable
- Slot exists (in disconnected database)

**Inputs:**
- slotId: Valid slot ObjectID
- scheduledDate: `"2024-12-25"`

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

### **UTCID157: Check Slot Availability with Invalid Date Format (Abnormal Case)**

**Description:** Tests checking slot availability with invalid date format.

**Preconditions:**
- Can connect with server
- Slot exists

**Inputs:**
- slotId: Valid slot ObjectID
- scheduledDate: `"invalid-date-format"`

**Expected Outcome:**
- Return: `400 Bad Request` or `200 OK` (depending on date parsing)
- Response: Error message or invalid date handling
- Exception: (Depends on date parsing)
- Log message: (Depends on date parsing)

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: getNotifications

### Function Details
- **Function Name:** `getNotifications`
- **File:** `backend/src/controller/notification/notification.controller.js`
- **Lines of code:** ~27 lines (7-33)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10
- **N/A/B:** 0

---

### **UTCID158: Get Notifications Successfully (Normal Case)**

**Description:** Tests successful retrieval of notifications for authenticated user.

**Preconditions:**
- Can connect with server
- User is authenticated (JWT token valid)
- User has notifications in database

**Inputs:**
- JWT token in Authorization header (req.user.sub contains account ID)
- page: (optional) `1`
- limit: (optional) `20`
- isRead: (optional) `false` or `true`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: {...} }`
- Notifications list returned
- Pagination info included
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID159: Get Notifications - Unauthorized (Abnormal Case)**

**Description:** Tests getting notifications without authentication.

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

### **UTCID160: Get Notifications with isRead Filter - Unread Only (Normal Case)**

**Description:** Tests getting notifications filtered to unread only.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has both read and unread notifications

**Inputs:**
- JWT token in Authorization header
- isRead: `false`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: {...} }`
- Only unread notifications returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID161: Get Notifications with isRead Filter - Read Only (Normal Case)**

**Description:** Tests getting notifications filtered to read only.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has both read and unread notifications

**Inputs:**
- JWT token in Authorization header
- isRead: `true`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: {...} }`
- Only read notifications returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID162: Get Notifications with Pagination (Normal Case)**

**Description:** Tests getting notifications with pagination parameters.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has more than 20 notifications

**Inputs:**
- JWT token in Authorization header
- page: `2`
- limit: `10`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { page: 2, limit: 10, total: ... } }`
- Only 10 notifications returned (page 2)
- Pagination info correct
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID163: Get Notifications - No Notifications (Normal Case)**

**Description:** Tests getting notifications when user has no notifications.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has no notifications in database

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [], pagination: { page: 1, limit: 20, total: 0 } }`
- Empty notifications list returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID164: Get Notifications with Invalid Page Number (Boundary Case)**

**Description:** Tests getting notifications with invalid page number.

**Preconditions:**
- Can connect with server
- User is authenticated

**Inputs:**
- JWT token in Authorization header
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

### **UTCID165: Get Notifications with Invalid Limit (Boundary Case)**

**Description:** Tests getting notifications with invalid limit value.

**Preconditions:**
- Can connect with server
- User is authenticated

**Inputs:**
- JWT token in Authorization header
- limit: `0` or `-1`

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: [...], pagination: { limit: 20, ... } }`
- Limit defaults to 20
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID166: Get Notifications - Database Connection Error (Abnormal Case)**

**Description:** Tests getting notifications when database connection fails.

**Preconditions:**
- Database connection unavailable
- User is authenticated
- User has notifications (in disconnected database)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Failed to get notifications" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID167: Get Notifications with Very Large Limit (Boundary Case)**

**Description:** Tests getting notifications with very large limit value.

**Preconditions:**
- Can connect with server
- User is authenticated

**Inputs:**
- JWT token in Authorization header
- limit: `10000`

**Expected Outcome:**
- Return: `200 OK` or `400 Bad Request` (depending on max limit)
- Response: All notifications or error if max limit enforced
- Exception: (Depends on validation)
- Log message: (Depends on validation)

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

## 🧪 TEST CASES CHO FUNCTION: markAsRead

### Function Details
- **Function Name:** `markAsRead`
- **File:** `backend/src/controller/notification/notification.controller.js`
- **Lines of code:** ~18 lines (39-57)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID168: Mark Notification as Read Successfully (Normal Case)**

**Description:** Tests successful marking of notification as read.

**Preconditions:**
- Can connect with server
- User is authenticated
- Notification exists and belongs to user
- Notification is unread

**Inputs:**
- JWT token in Authorization header
- id: Valid notification ID (from req.params.id)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { notification: {...}, is_read: true } }`
- Notification is_read field set to true
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID169: Mark Notification as Read - Unauthorized (Abnormal Case)**

**Description:** Tests marking notification as read without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- id: Valid notification ID

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

### **UTCID170: Mark Notification as Read - Notification Not Found (Abnormal Case)**

**Description:** Tests marking non-existent notification as read.

**Preconditions:**
- Can connect with server
- User is authenticated
- Notification does not exist

**Inputs:**
- JWT token in Authorization header
- id: Non-existent notification ID

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "Notification not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID171: Mark Notification as Read - Notification Belongs to Different User (Security Test)**

**Description:** Tests marking notification as read when notification belongs to different user.

**Preconditions:**
- Can connect with server
- User A is authenticated
- Notification exists but belongs to User B

**Inputs:**
- JWT token in Authorization header (User A)
- id: Notification ID belonging to User B

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "Notification not found" }`
- System should prevent access to other users' notifications
- Exception: (None)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID172: Mark Notification as Read - Already Read (Boundary Case)**

**Description:** Tests marking notification as read when it's already read.

**Preconditions:**
- Can connect with server
- User is authenticated
- Notification exists and belongs to user
- Notification is already read

**Inputs:**
- JWT token in Authorization header
- id: Valid notification ID (already read)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, data: { notification: {...}, is_read: true } }`
- Notification remains read
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID173: Mark Notification as Read with Invalid ID Format (Abnormal Case)**

**Description:** Tests marking notification as read with invalid ID format.

**Preconditions:**
- Can connect with server
- User is authenticated

**Inputs:**
- JWT token in Authorization header
- id: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "Notification not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID174: Mark Notification as Read - Database Connection Error (Abnormal Case)**

**Description:** Tests marking notification as read when database connection fails.

**Preconditions:**
- Database connection unavailable
- User is authenticated
- Notification exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- id: Valid notification ID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Failed to mark notification as read" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID175: Mark Notification as Read with Missing ID (Abnormal Case)**

**Description:** Tests marking notification as read when ID is missing.

**Preconditions:**
- Can connect with server
- User is authenticated

**Inputs:**
- JWT token in Authorization header
- id: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "Notification not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: markAllAsRead

### Function Details
- **Function Name:** `markAllAsRead`
- **File:** `backend/src/controller/notification/notification.controller.js`
- **Lines of code:** ~18 lines (63-80)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID176: Mark All Notifications as Read Successfully (Normal Case)**

**Description:** Tests successful marking of all notifications as read.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has unread notifications

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, updatedCount: X, message: "All notifications marked as read" }`
- All user's notifications marked as read
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID177: Mark All Notifications as Read - Unauthorized (Abnormal Case)**

**Description:** Tests marking all notifications as read without authentication.

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

### **UTCID178: Mark All Notifications as Read - No Unread Notifications (Normal Case)**

**Description:** Tests marking all notifications as read when user has no unread notifications.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has no unread notifications (all already read)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, updatedCount: 0, message: "All notifications marked as read" }`
- No notifications updated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID179: Mark All Notifications as Read - No Notifications (Normal Case)**

**Description:** Tests marking all notifications as read when user has no notifications.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has no notifications

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, updatedCount: 0, message: "All notifications marked as read" }`
- No notifications updated
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID180: Mark All Notifications as Read - Database Connection Error (Abnormal Case)**

**Description:** Tests marking all notifications as read when database connection fails.

**Preconditions:**
- Database connection unavailable
- User is authenticated
- User has notifications (in disconnected database)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Failed to mark all as read" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID181: Mark All Notifications as Read - Large Number of Notifications (Boundary Case)**

**Description:** Tests marking all notifications as read when user has large number of notifications.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has 1000+ unread notifications

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, updatedCount: 1000+, message: "All notifications marked as read" }`
- All notifications marked as read
- Performance acceptable
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: getUnreadCount

### Function Details
- **Function Name:** `getUnreadCount`
- **File:** `backend/src/controller/notification/notification.controller.js`
- **Lines of code:** ~18 lines (86-103)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 6
- **Passed:** 0
- **Failed:** 0
- **Untested:** 6
- **N/A/B:** 0

---

### **UTCID182: Get Unread Count Successfully (Normal Case)**

**Description:** Tests successful retrieval of unread notifications count.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has unread notifications

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, unreadCount: X }`
- Correct unread count returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID183: Get Unread Count - Unauthorized (Abnormal Case)**

**Description:** Tests getting unread count without authentication.

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

### **UTCID184: Get Unread Count - Zero Unread (Normal Case)**

**Description:** Tests getting unread count when user has no unread notifications.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has no unread notifications

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, unreadCount: 0 }`
- Zero count returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID185: Get Unread Count - No Notifications (Normal Case)**

**Description:** Tests getting unread count when user has no notifications.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has no notifications

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, unreadCount: 0 }`
- Zero count returned
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID186: Get Unread Count - Database Connection Error (Abnormal Case)**

**Description:** Tests getting unread count when database connection fails.

**Preconditions:**
- Database connection unavailable
- User is authenticated
- User has notifications (in disconnected database)

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Failed to get unread count" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID187: Get Unread Count - Large Number (Boundary Case)**

**Description:** Tests getting unread count when user has large number of unread notifications.

**Preconditions:**
- Can connect with server
- User is authenticated
- User has 1000+ unread notifications

**Inputs:**
- JWT token in Authorization header

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, unreadCount: 1000+ }`
- Correct large count returned
- Performance acceptable
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

## 🧪 TEST CASES CHO FUNCTION: deleteNotification

### Function Details
- **Function Name:** `deleteNotification`
- **File:** `backend/src/controller/notification/notification.controller.js`
- **Lines of code:** ~19 lines (109-127)
- **Created By:** (Team)
- **Executed By:** (Tester)

### Test Summary
- **Total Test Cases:** 8
- **Passed:** 0
- **Failed:** 0
- **Untested:** 8
- **N/A/B:** 0

---

### **UTCID188: Delete Notification Successfully (Normal Case)**

**Description:** Tests successful deletion of notification.

**Preconditions:**
- Can connect with server
- User is authenticated
- Notification exists and belongs to user

**Inputs:**
- JWT token in Authorization header
- id: Valid notification ID (from req.params.id)

**Expected Outcome:**
- Return: `200 OK`
- Response: `{ success: true, message: "Notification deleted successfully" }`
- Notification deleted from database
- Exception: (None)
- Log message: (None)

**Result:**
- Type: Normal (N)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID189: Delete Notification - Unauthorized (Abnormal Case)**

**Description:** Tests deleting notification without authentication.

**Preconditions:**
- Can connect with server
- User is not authenticated

**Inputs:**
- No JWT token in Authorization header
- id: Valid notification ID

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

### **UTCID190: Delete Notification - Notification Not Found (Abnormal Case)**

**Description:** Tests deleting non-existent notification.

**Preconditions:**
- Can connect with server
- User is authenticated
- Notification does not exist

**Inputs:**
- JWT token in Authorization header
- id: Non-existent notification ID

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "Notification not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID191: Delete Notification - Notification Belongs to Different User (Security Test)**

**Description:** Tests deleting notification when notification belongs to different user.

**Preconditions:**
- Can connect with server
- User A is authenticated
- Notification exists but belongs to User B

**Inputs:**
- JWT token in Authorization header (User A)
- id: Notification ID belonging to User B

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "Notification not found" }`
- System should prevent deletion of other users' notifications
- Exception: (None)
- Log message: May log security attempt

**Result:**
- Type: Abnormal (A) - Security Test
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID192: Delete Notification with Invalid ID Format (Abnormal Case)**

**Description:** Tests deleting notification with invalid ID format.

**Preconditions:**
- Can connect with server
- User is authenticated

**Inputs:**
- JWT token in Authorization header
- id: `"invalid-id-format"` (not a valid ObjectID)

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "Notification not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID193: Delete Notification with Missing ID (Abnormal Case)**

**Description:** Tests deleting notification when ID is missing.

**Preconditions:**
- Can connect with server
- User is authenticated

**Inputs:**
- JWT token in Authorization header
- id: `undefined` or `null` or `""`

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "Notification not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID194: Delete Notification - Database Connection Error (Abnormal Case)**

**Description:** Tests deleting notification when database connection fails.

**Preconditions:**
- Database connection unavailable
- User is authenticated
- Notification exists (in disconnected database)

**Inputs:**
- JWT token in Authorization header
- id: Valid notification ID

**Expected Outcome:**
- Return: `500 Internal Server Error`
- Response: `{ success: false, error: "Failed to delete notification" }`
- Exception: Database connection error
- Log message: Error log

**Result:**
- Type: Abnormal (A)
- Status: Untested (U)
- Executed Date: (TBD)

---

### **UTCID195: Delete Notification - Already Deleted (Boundary Case)**

**Description:** Tests deleting notification that has already been deleted.

**Preconditions:**
- Can connect with server
- User is authenticated
- Notification was previously deleted

**Inputs:**
- JWT token in Authorization header
- id: Previously deleted notification ID

**Expected Outcome:**
- Return: `404 Not Found`
- Response: `{ success: false, error: "Notification not found" }`
- Exception: (None)
- Log message: Error log

**Result:**
- Type: Boundary (B)
- Status: Untested (U)
- Executed Date: (TBD)

---

**Lưu ý:** Tài liệu này đã bổ sung test cases cho:
- ✅ Auth Controller: 10 functions (68 test cases)
- ✅ Appointment Controller: 5 functions (getById, getByPatient, getAvailableSlots, checkSlotAvailability) - 34 test cases
- ✅ Notification Controller: 5 functions (getNotifications, markAsRead, markAllAsRead, getUnreadCount, deleteNotification) - 40 test cases

**Tổng cộng đã có:** 142 test cases cho 20 functions. Các functions còn lại trong Doctor, Clinic, Patient, Admin Clinic controllers sẽ được bổ sung tiếp theo trong các phiên làm việc sau.

