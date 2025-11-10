# Test Plan - Danh sách Functions và Test Cases

## 📋 DANH SÁCH CÁC FUNCTIONS

### 🔐 AUTH CONTROLLER (backend/src/controller/auth/auth.controller.js)

1. **registerPatients** - Đăng ký tài khoản bệnh nhân/clinic owner
2. **googleLogin** - Đăng nhập bằng Google
3. **verifyEmail** - Xác minh email
4. **login** - Đăng nhập
5. **refresh** - Refresh token
6. **logout** - Đăng xuất
7. **requestVerifyEmail** - Yêu cầu gửi lại email xác minh
8. **requestPasswordReset** - Yêu cầu reset mật khẩu
9. **resetPassword** - Reset mật khẩu
10. **changePassword** - Đổi mật khẩu

### 📅 APPOINTMENT CONTROLLER (backend/src/controller/appoinment/appointment.controller.js)

11. **create** - Tạo cuộc hẹn mới
12. **getById** - Lấy thông tin cuộc hẹn theo ID
13. **getByPatient** - Lấy danh sách cuộc hẹn của bệnh nhân
14. **getAvailableSlots** - Lấy các slot khả dụng
15. **checkSlotAvailability** - Kiểm tra tính khả dụng của slot

### 👨‍⚕️ DOCTOR CONTROLLER (backend/src/controller/doctor/doctor.controler.js)

16. **viewListPatients** - Xem danh sách bệnh nhân
17. **viewPatientById** - Xem thông tin bệnh nhân theo ID
18. **viewAppointments** - Xem danh sách cuộc hẹn
19. **viewAppointmentDetail** - Xem chi tiết cuộc hẹn
20. **requestViewMedicalRecord** - Yêu cầu xem hồ sơ bệnh án
21. **requestViewMedicalRecordById** - Yêu cầu xem hồ sơ bệnh án theo ID
22. **viewHistoryMedicalRecordRequests** - Xem lịch sử yêu cầu hồ sơ bệnh án
23. **viewListMedicalRecords** - Xem danh sách hồ sơ bệnh án
24. **viewListMedicalRecordsVerify** - Xem danh sách hồ sơ bệnh án cần xác minh
25. **viewListMedicalRecordsByPatient** - Xem danh sách hồ sơ bệnh án của bệnh nhân
26. **viewMedicalRecordDetail** - Xem chi tiết hồ sơ bệnh án
27. **verifyMedicalRecord** - Xác minh hồ sơ bệnh án
28. **viewFeedbackList** - Xem danh sách phản hồi
29. **createAssistant** - Tạo tài khoản trợ lý
30. **banOrUnbanAssistant** - Cấm/Bỏ cấm trợ lý
31. **viewListAssistants** - Xem danh sách trợ lý
32. **viewProfile** - Xem profile bác sĩ
33. **updateProfile** - Cập nhật profile bác sĩ
34. **uploadLicense** - Tải lên giấy phép hành nghề
35. **getLicense** - Lấy thông tin giấy phép hành nghề

### 🏥 CLINIC CONTROLLER

36. **getAllClinic** - Lấy danh sách tất cả phòng khám
37. **getClinicDetail** - Lấy chi tiết phòng khám
38. **getClinicDoctors** - Lấy danh sách bác sĩ của phòng khám
39. **getClinicReviews** - Lấy đánh giá của phòng khám
40. **createClinicBooking** - Tạo booking phòng khám
41. **createRegistrationRequest** - Tạo yêu cầu đăng ký phòng khám
42. **getSpecialties** - Lấy danh sách chuyên khoa
43. **getPendingClinics** - Lấy danh sách phòng khám chờ duyệt
44. **approveClinic** - Duyệt phòng khám
45. **rejectClinic** - Từ chối phòng khám
46. **getAllSpecialties** - Lấy tất cả chuyên khoa
47. **getSpecialtyById** - Lấy chuyên khoa theo ID
48. **getBookingStatistics** - Lấy thống kê booking
49. **getBookingTrends** - Lấy xu hướng booking
50. **getTopSpecialties** - Lấy top chuyên khoa
51. **getSpecialtyDetails** - Lấy chi tiết chuyên khoa
52. **getDoctorPerformance** - Lấy hiệu suất bác sĩ
53. **getDoctorDetailedPerformance** - Lấy chi tiết hiệu suất bác sĩ

### 👤 USER/PATIENT CONTROLLER

54. **setLocation** - Thiết lập vị trí bệnh nhân
55. **getMyProfile** - Lấy profile của tôi
56. **updateMyProfile** - Cập nhật profile của tôi
57. **updateSettings** - Cập nhật cài đặt
58. **listMyRecords** - Liệt kê hồ sơ bệnh án của tôi
59. **getRecordDetail** - Lấy chi tiết hồ sơ bệnh án
60. **requestAccess** - Yêu cầu truy cập
61. **updateAccessRequest** - Cập nhật yêu cầu truy cập

### 🔔 NOTIFICATION CONTROLLER

62. **getNotifications** - Lấy danh sách thông báo
63. **markAsRead** - Đánh dấu đã đọc
64. **markAllAsRead** - Đánh dấu tất cả đã đọc
65. **getUnreadCount** - Lấy số lượng chưa đọc
66. **deleteNotification** - Xóa thông báo

### 🏥 ADMIN CLINIC CONTROLLER

67. **createAccountDoctor** - Tạo tài khoản bác sĩ
68. **getClinicByAdmin** - Lấy phòng khám theo admin
69. **getDoctorsOfAdminClinic** - Lấy danh sách bác sĩ của phòng khám
70. **createAccountAssistant** - Tạo tài khoản trợ lý
71. **getAssistants** - Lấy danh sách trợ lý
72. **deleteAssistant** - Xóa trợ lý
73. **getPendingLicenses** - Lấy danh sách giấy phép chờ duyệt
74. **updateLicenseStatus** - Cập nhật trạng thái giấy phép

### 🗺️ ADDRESS CONTROLLER

75. **getProvinceOptions** - Lấy danh sách tỉnh/thành
76. **getWardsByProvince** - Lấy danh sách phường/xã theo tỉnh

### 👨‍⚕️ ASSISTANT CONTROLLER

77. **viewListPatients** - Xem danh sách bệnh nhân (Assistant)
78. **viewPatientById** - Xem thông tin bệnh nhân (Assistant)
79. **viewAppointments** - Xem danh sách cuộc hẹn (Assistant)
80. **viewAppointmentDetail** - Xem chi tiết cuộc hẹn (Assistant)
81. **verifyAppointment** - Xác minh cuộc hẹn
82. **viewAppointmentSlot** - Xem slot cuộc hẹn
83. **viewSlotById** - Xem slot theo ID
84. **createAppointmentSlot** - Tạo slot cuộc hẹn
85. **updateAppointmentSlot** - Cập nhật slot cuộc hẹn
86. **viewListMedicalRecords** - Xem danh sách hồ sơ bệnh án (Assistant)
87. **viewMedicalRecordDetail** - Xem chi tiết hồ sơ bệnh án (Assistant)
88. **updateMedicalRecord** - Cập nhật hồ sơ bệnh án
89. **createMedicalRecord** - Tạo hồ sơ bệnh án
90. **viewProfile** - Xem profile (Assistant)

---

## 🧪 TEST CASES CHO FUNCTION: registerPatients

### Function Details
- **Function Name:** `registerPatients`
- **File:** `backend/src/controller/auth/auth.controller.js`
- **Lines of code:** ~94 lines (57-156)
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

### Test Summary
- **Total Test Cases:** 10
- **Passed:** 0
- **Failed:** 0
- **Untested:** 10

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
- **Lines of code:** ~32 lines (10-32)

### Test Summary
- **Total Test Cases:** 12
- **Passed:** 0
- **Failed:** 0
- **Untested:** 12

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
- Scheduled_date: Valid future date
- Symptoms: `"Headache and fever"`
- Notes: `"Patient requested morning appointment"`

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
- Scheduled_date: Valid future date
- Symptoms: `"Headache"`

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
- Patient_id: Invalid ObjectID or non-existent ID
- Doctor_id: Valid ObjectID
- Slot_id: Valid ObjectID
- Scheduled_date: Valid future date
- Symptoms: `"Headache"`

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

