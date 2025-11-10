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

**Lưu ý:** Tài liệu này cung cấp test cases mẫu cho 3 functions chính. Các functions khác cần được bổ sung test cases tương tự theo cùng định dạng.

