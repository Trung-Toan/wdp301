# 📋 DANH SÁCH TẤT CẢ CÁC FUNCTIONS TRONG CODEBASE

## 🔐 AUTH CONTROLLER (backend/src/controller/auth/auth.controller.js)

| # | Function Name | Mô tả | Lines | Test Cases |
|---|---------------|-------|-------|------------|
| 1 | `registerPatients` | Đăng ký tài khoản bệnh nhân/clinic owner | 57-156 | 15 test cases |
| 2 | `googleLogin` | Đăng nhập bằng Google | 13-55 | Cần bổ sung |
| 3 | `verifyEmail` | Xác minh email | 159-169 | Cần bổ sung |
| 4 | `login` | Đăng nhập | 171-186 | 10 test cases |
| 5 | `refresh` | Refresh token | 188-203 | Cần bổ sung |
| 6 | `logout` | Đăng xuất | 205-213 | Cần bổ sung |
| 7 | `requestVerifyEmail` | Yêu cầu gửi lại email xác minh | 215-223 | Cần bổ sung |
| 8 | `requestPasswordReset` | Yêu cầu reset mật khẩu | 225-233 | Cần bổ sung |
| 9 | `resetPassword` | Reset mật khẩu | 235-243 | Cần bổ sung |
| 10 | `changePassword` | Đổi mật khẩu | 245-269 | Cần bổ sung |

## 📅 APPOINTMENT CONTROLLER (backend/src/controller/appoinment/appointment.controller.js)

| # | Function Name | Mô tả | Lines | Test Cases |
|---|---------------|-------|-------|------------|
| 11 | `create` | Tạo cuộc hẹn mới | 10-32 | 12 test cases |
| 12 | `getById` | Lấy thông tin cuộc hẹn theo ID | 34-41 | Cần bổ sung |
| 13 | `getByPatient` | Lấy danh sách cuộc hẹn của bệnh nhân | 43-63 | Cần bổ sung |
| 14 | `getAvailableSlots` | Lấy các slot khả dụng | 68-90 | Cần bổ sung |
| 15 | `checkSlotAvailability` | Kiểm tra tính khả dụng của slot | 95-138 | Cần bổ sung |

## 👨‍⚕️ DOCTOR CONTROLLER (backend/src/controller/doctor/doctor.controler.js)

| # | Function Name | Mô tả | Lines | Test Cases |
|---|---------------|-------|-------|------------|
| 16 | `viewListPatients` | Xem danh sách bệnh nhân | 12-35 | Cần bổ sung |
| 17 | `viewPatientById` | Xem thông tin bệnh nhân theo ID | 38-63 | Cần bổ sung |
| 18 | `viewAppointments` | Xem danh sách cuộc hẹn | 67-92 | Cần bổ sung |
| 19 | `viewAppointmentDetail` | Xem chi tiết cuộc hẹn | 95-115 | Cần bổ sung |
| 20 | `requestViewMedicalRecord` | Yêu cầu xem hồ sơ bệnh án | 119-156 | Cần bổ sung |
| 21 | `requestViewMedicalRecordById` | Yêu cầu xem hồ sơ bệnh án theo ID | 159-195 | Cần bổ sung |
| 22 | `viewHistoryMedicalRecordRequests` | Xem lịch sử yêu cầu hồ sơ bệnh án | 198-216 | Cần bổ sung |
| 23 | `viewListMedicalRecords` | Xem danh sách hồ sơ bệnh án | 220-238 | Cần bổ sung |
| 24 | `viewListMedicalRecordsVerify` | Xem danh sách hồ sơ bệnh án cần xác minh | 241-259 | Cần bổ sung |
| 25 | `viewListMedicalRecordsByPatient` | Xem danh sách hồ sơ bệnh án của bệnh nhân | 262-280 | Cần bổ sung |
| 26 | `viewMedicalRecordDetail` | Xem chi tiết hồ sơ bệnh án | 283-314 | Cần bổ sung |
| 27 | `verifyMedicalRecord` | Xác minh hồ sơ bệnh án | 317-333 | Cần bổ sung |
| 28 | `viewFeedbackList` | Xem danh sách phản hồi | 337-347 | Cần bổ sung |
| 29 | `createAssistant` | Tạo tài khoản trợ lý | 351-379 | Cần bổ sung |
| 30 | `banOrUnbanAssistant` | Cấm/Bỏ cấm trợ lý | 382-406 | Cần bổ sung |
| 31 | `viewListAssistants` | Xem danh sách trợ lý | 409-429 | Cần bổ sung |
| 32 | `viewProfile` | Xem profile bác sĩ | 433-441 | Cần bổ sung |
| 33 | `updateProfile` | Cập nhật profile bác sĩ | 444-451 | Cần bổ sung |
| 34 | `uploadLicense` | Tải lên giấy phép hành nghề | 454-465 | Cần bổ sung |
| 35 | `getLicense` | Lấy thông tin giấy phép hành nghề | 468-475 | Cần bổ sung |

## 🏥 CLINIC CONTROLLER

| # | Function Name | Mô tả | File | Lines | Test Cases |
|---|---------------|-------|------|-------|------------|
| 36 | `getAllClinic` | Lấy danh sách tất cả phòng khám | clinic.controller.js | 3-10 | Cần bổ sung |

## 👤 USER/PATIENT CONTROLLER

| # | Function Name | Mô tả | File | Lines | Test Cases |
|---|---------------|-------|------|-------|------------|
| 37 | `setLocation` | Thiết lập vị trí bệnh nhân | patient.controller.js | 3-23 | Cần bổ sung |
| 38 | `getMyProfile` | Lấy profile của tôi | profile.controller.js | 8-41 | Cần bổ sung |
| 39 | `updateMyProfile` | Cập nhật profile của tôi | profile.controller.js | 43-146 | Cần bổ sung |
| 40 | `updateSettings` | Cập nhật cài đặt | profile.controller.js | 149-178 | Cần bổ sung |

## 🔔 NOTIFICATION CONTROLLER (backend/src/controller/notification/notification.controller.js)

| # | Function Name | Mô tả | Lines | Test Cases |
|---|---------------|-------|-------|------------|
| 41 | `getNotifications` | Lấy danh sách thông báo | 7-33 | Cần bổ sung |
| 42 | `markAsRead` | Đánh dấu đã đọc | 39-57 | Cần bổ sung |
| 43 | `markAllAsRead` | Đánh dấu tất cả đã đọc | 63-80 | Cần bổ sung |
| 44 | `getUnreadCount` | Lấy số lượng chưa đọc | 86-103 | Cần bổ sung |
| 45 | `deleteNotification` | Xóa thông báo | 109-127 | Cần bổ sung |

## 🏥 ADMIN CLINIC CONTROLLER (backend/src/controller/admin_clinic/admin_clinic.controller.js)

| # | Function Name | Mô tả | Lines | Test Cases |
|---|---------------|-------|-------|------------|
| 46 | `createAccountDoctor` | Tạo tài khoản bác sĩ | 13-29 | Cần bổ sung |
| 47 | `getClinicByAdmin` | Lấy phòng khám theo admin | 32-40 | Cần bổ sung |
| 48 | `getDoctorsOfAdminClinic` | Lấy danh sách bác sĩ của phòng khám | 43-67 | Cần bổ sung |
| 49 | `createAccountAssistant` | Tạo tài khoản trợ lý | 70-86 | Cần bổ sung |
| 50 | `getAssistants` | Lấy danh sách trợ lý | 89-103 | Cần bổ sung |
| 51 | `deleteAssistant` | Xóa trợ lý | 106-113 | Cần bổ sung |
| 52 | `getPendingLicenses` | Lấy danh sách giấy phép chờ duyệt | 116-126 | Cần bổ sung |
| 53 | `updateLicenseStatus` | Cập nhật trạng thái giấy phép | 129-145 | Cần bổ sung |

---

## 📊 TỔNG KẾT

- **Tổng số Functions:** 53
- **Functions đã có Test Cases:** 3 (registerPatients, login, create)
- **Functions cần bổ sung Test Cases:** 50

---

## 📝 HƯỚNG DẪN SỬ DỤNG

1. Xem danh sách functions: File `FUNCTIONS_LIST.md` (file này)
2. Xem test cases chi tiết: File `TEST_PLAN_COMPLETE.md`
3. Format test cases theo định dạng trong ảnh mẫu:
   - Function Details (Name, File, Lines of code)
   - Test Summary (Passed, Failed, Untested, N/A/B)
   - Individual Test Cases với:
     - UTCID
     - Description
     - Preconditions
     - Inputs
     - Expected Outcome
     - Result (Type: N/A/B, Status: P/F/U, Executed Date)

---

**Lưu ý:** Các test cases trong `TEST_PLAN_COMPLETE.md` được viết theo định dạng tương tự như trong ảnh mẫu, bao gồm đầy đủ thông tin cần thiết cho unit testing.

