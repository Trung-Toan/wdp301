# PROJECT TRACKING - WDP301
## Hệ Thống Đặt Lịch Khám Bệnh Trực Tuyến

---

## 📋 TỔNG QUAN DỰ ÁN

**Tên dự án:** WDP301 - Hệ thống quản lý đặt lịch khám bệnh  
**Loại dự án:** Full-stack Web Application  
**Mô tả:** Hệ thống đặt lịch khám bệnh trực tuyến với nhiều vai trò người dùng, hỗ trợ bệnh nhân, bác sĩ, phòng khám, và quản trị viên hệ thống.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Backend
- **Framework:** Node.js + Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Token) với refresh token rotation
- **File Upload:** Multer
- **Email Service:** Nodemailer
- **API Documentation:** Swagger/OpenAPI
- **Validation:** Express Validator
- **Security:** bcryptjs, Google Auth Library
- **Utilities:** Moment-timezone, UUID

### Frontend
- **Framework:** React 19.1.1
- **Routing:** React Router DOM v7.8.2
- **State Management:** Redux + Redux Thunk
- **UI Libraries:** 
  - Material-UI (MUI) v7.3.2
  - Bootstrap 5.3.8
  - React Bootstrap
  - Tailwind CSS 3.4.17
  - Lucide React (Icons)
- **Forms:** Formik + Yup
- **HTTP Client:** Axios
- **Date Handling:** date-fns, date-fns-tz, react-datepicker
- **Notifications:** React Hot Toast, React Toastify
- **Charts:** Recharts
- **Animations:** Framer Motion
- **File Export:** React CSV
- **Google OAuth:** @react-oauth/google

---

## 👥 VAI TRÒ NGƯỜI DÙNG

1. **PATIENT** - Bệnh nhân/Khách hàng
2. **DOCTOR** - Bác sĩ
3. **ASSISTANT** - Trợ lý phòng khám
4. **ADMIN_CLINIC** - Quản trị viên phòng khám
5. **ADMIN_SYSTEM** - Quản trị viên hệ thống

---

## 🗄️ CƠ SỞ DỮ LIỆU (MongoDB Models)

### Authentication & User Management
- **Account** - Tài khoản hệ thống
- **User** - Thông tin người dùng
- **AdminSystem** - Quản trị viên hệ thống
- **AdminClinic** - Quản trị viên phòng khám
- **Assistant** - Trợ lý phòng khám
- **Patient** - Bệnh nhân
- **EmailVerification** - Xác minh email
- **PasswordReset** - Đặt lại mật khẩu
- **LoginAttempt** - Theo dõi đăng nhập
- **Session** - Quản lý phiên đăng nhập
- **AuthProviders** - Nhà cung cấp xác thực (Google, etc.)

### Medical & Clinic
- **Doctor** - Thông tin bác sĩ
- **Clinic** - Phòng khám
- **Specialty** - Chuyên khoa
- **License** - Giấy phép hành nghề
- **Appointment** - Cuộc hẹn khám bệnh
- **Slot** - Khung giờ khám
- **Complaint** - Khiếu nại
- **MedicalRecord** - Hồ sơ bệnh án
- **Feedback** - Phản hồi từ bệnh nhân

### Location
- **Province** - Tỉnh/Thành phố
- **Ward** - Phường/Xã
- **AddressDetail** - Chi tiết địa chỉ

### System
- **Notifications** - Thông báo hệ thống
- **Blacklist** - Danh sách đen

---

## 🔌 API ENDPOINTS

### Authentication (`/api/auth`)
- `POST /register` - Đăng ký tài khoản (Patient, Admin Clinic)
- `POST /login` - Đăng nhập
- `POST /google` - Đăng nhập bằng Google OAuth
- `POST /refresh` - Làm mới token
- `POST /logout` - Đăng xuất
- `POST /verify-email` - Xác minh email
- `GET /verify-email` - Xác minh email (GET)
- `POST /request-verify-email` - Gửi lại email xác minh
- `POST /request-password-reset` - Yêu cầu đặt lại mật khẩu
- `POST /reset-password` - Đặt lại mật khẩu
- `PUT /change-password` - Thay đổi mật khẩu

### Doctor (`/api/doctor`)
- Quản lý thông tin bác sĩ
- Tìm kiếm bác sĩ
- Lấy danh sách bác sĩ theo chuyên khoa
- Lấy top bác sĩ
- Chi tiết bác sĩ

### Clinic (`/api/clinic`)
- Quản lý phòng khám
- Tìm kiếm phòng khám
- Đăng ký phòng khám mới
- Chi tiết phòng khám

### Appointment (`/api/appointments`)
- Đặt lịch khám
- Quản lý lịch hẹn
- Hủy lịch hẹn
- Xác nhận lịch hẹn
- Lịch sử cuộc hẹn

### Patient (`/api/patient`)
- Quản lý thông tin bệnh nhân
- Hồ sơ bệnh án (Medical Records)
- Lịch sử khám bệnh

### Assistant (`/api/assistant`)
- Quản lý lịch hẹn (cho trợ lý)
- Quản lý bệnh nhân
- Quản lý slot

### Admin Clinic (`/api/admin_clinic`)
- Quản lý phòng khám
- Quản lý bác sĩ
- Quản lý trợ lý
- Quản lý giấy phép
- Dashboard phòng khám
- Quản lý khiếu nại
- Quản lý blacklist

### Admin System (`/api/admin-system`)
- Quản lý tài khoản hệ thống
- Quản lý phòng khám (duyệt/phê duyệt)
- Quản lý giấy phép
- Quản lý khiếu nại
- Quản lý blacklist
- Dashboard hệ thống

### Location (`/api/locations`)
- Lấy danh sách tỉnh/thành
- Lấy danh sách phường/xã
- Tìm kiếm địa điểm

### Notification (`/api/notifications`)
- Lấy danh sách thông báo
- Đánh dấu đã đọc
- Xóa thông báo

### File Upload (`/api/file`)
- Upload file (ảnh, tài liệu)

### User (`/api/user`)
- Quản lý thông tin người dùng
- Cập nhật profile

---

## 🎨 FRONTEND PAGES & COMPONENTS

### Public Pages (Home)
- **HomePage** - Trang chủ
  - Hero Section
  - Features Section
  - Featured Doctors Section
  - Specialties Section
  - CTA Section
- **DoctorList** - Danh sách bác sĩ
- **DoctorDetail** - Chi tiết bác sĩ
- **SpecialtyList** - Danh sách chuyên khoa
- **SpecialtyDetail** - Chi tiết chuyên khoa
- **ClinicSearch** - Tìm kiếm phòng khám
- **ClinicList** - Danh sách phòng khám
- **ClinicDetail** - Chi tiết phòng khám
- **FacilityBooking** - Đặt lịch khám tại phòng khám

### Authentication
- **Login** - Đăng nhập
- **Register** - Đăng ký
- **ForgotPassword** - Quên mật khẩu
- **ResetPassword** - Đặt lại mật khẩu
- **GoogleLoginButton** - Đăng nhập bằng Google

### Patient Features
- **Profile** - Hồ sơ bệnh nhân
  - PersonalTab - Thông tin cá nhân
  - MedicalInfoTab - Thông tin y tế
  - HistoryTab - Lịch sử khám
  - RecordsTab - Hồ sơ bệnh án
    - RecordInfo - Thông tin hồ sơ
    - Symptoms - Triệu chứng
    - CurrentDiseases - Bệnh hiện tại
    - Prescriptions - Đơn thuốc
    - Notes - Ghi chú
    - Attachments - Tệp đính kèm
    - AccessRequests - Yêu cầu truy cập
  - SettingsTab - Cài đặt
- **Appointment** - Đặt lịch khám
- **Booking** - Trang đặt lịch
- **BookingSuccess** - Xác nhận đặt lịch thành công
- **AppointmentsPage** - Trang quản lý lịch hẹn

### Doctor Features
- **DoctorDashboard** - Dashboard bác sĩ
- **DoctorProfile** - Hồ sơ bác sĩ
- **AppointmentSchedule** - Lịch khám bệnh
- **PatientList** - Danh sách bệnh nhân
- **PatientMedicalRecords** - Hồ sơ bệnh án bệnh nhân
- **MedicalRecordRequests** - Yêu cầu truy cập hồ sơ
- **FeedbackView** - Xem phản hồi
- **AssistantManagement** - Quản lý trợ lý
- **DoctorChangePassword** - Đổi mật khẩu

### Assistant Features
- **AssistantDashboard** - Dashboard trợ lý
- **AppointmentComponent** - Quản lý lịch hẹn
- **ApproveAppointment** - Duyệt lịch hẹn
- **PatientList** - Danh sách bệnh nhân
- **SlotSchedule** - Quản lý khung giờ
- **MedicalRecord** - Quản lý hồ sơ bệnh án
- **AssistantProfile** - Hồ sơ trợ lý

### Admin Clinic Features
- **ClinicDashboard** - Dashboard phòng khám
- **ClinicList** - Danh sách phòng khám
- **ClinicCreate** - Tạo phòng khám
- **ClinicEdit** - Chỉnh sửa phòng khám
- **DoctorManagement** - Quản lý bác sĩ
- **AssistantManagement** - Quản lý trợ lý
- **ApproveDoctorLicenses** - Duyệt giấy phép bác sĩ
- **BlacklistDetails** - Chi tiết blacklist
- **OverloadAlerts** - Cảnh báo quá tải
- **AnonymousFeedback** - Phản hồi ẩn danh

### Admin System Features
- **Dashboard** - Dashboard hệ thống
- **ManageAccounts** - Quản lý tài khoản
- **ManageBannedAccounts** - Quản lý tài khoản bị cấm
- **ManageClinics** - Quản lý phòng khám
- **ApprovedClinics** - Phòng khám đã duyệt
- **ManageLicenses** - Quản lý giấy phép
- **ManageComplaints** - Quản lý khiếu nại
- **ManageBlacklist** - Quản lý blacklist

### Notifications
- **NotificationListPage** - Danh sách thông báo
- **NotificationDetailPage** - Chi tiết thông báo
- **NotificationDropdown** - Dropdown thông báo

### Shared Components
- **Header** - Header chung
- **Footer** - Footer chung
- **Loading** - Component loading
- **AccessibilitySettings** - Cài đặt khả năng truy cập
- **FirstTimeGuide** - Hướng dẫn lần đầu
- **StepByStepGuide** - Hướng dẫn từng bước
- **HelpButton** - Nút trợ giúp
- **UnauthorizedPage** - Trang không có quyền
- **FileUploader** - Component upload file
- **LocationSelector** - Chọn địa điểm
- **DoctorBookingCalendar** - Lịch đặt lịch bác sĩ

### UI Components (`components/ui/`)
- 12 UI components (buttons, modals, forms, etc.)

---

## ♿ TÍNH NĂNG KHẢ NĂNG TRUY CẬP (Accessibility)

### Các tính năng hỗ trợ:
1. **Elderly Mode** - Chế độ cho người cao tuổi (tự động bật cho người ≥60 tuổi)
2. **Large Font** - Phóng to font chữ
3. **Large Buttons** - Nút lớn hơn
4. **High Contrast** - Độ tương phản cao
5. **Simplified UI** - Giao diện đơn giản hóa
6. **Reduce Motion** - Giảm chuyển động
7. **Text to Speech** - Chuyển văn bản thành giọng nói (sẵn sàng)
8. **First Time Guide** - Hướng dẫn lần đầu sử dụng (cho nhiều trang)
9. **Help Button** - Nút trợ giúp luôn hiển thị

### Context: `AccessibilityContext`
- Quản lý cài đặt khả năng truy cập
- Lưu trữ trong localStorage
- Áp dụng tự động cho toàn bộ ứng dụng

---

## 📁 CẤU TRÚC THƯ MỤC

### Backend
```
backend/
├── src/
│   ├── config/          # Cấu hình (DB, Swagger, env)
│   ├── controller/      # Controllers
│   ├── middleware/      # Middleware (auth, validation)
│   ├── model/           # MongoDB Models
│   ├── router/          # API Routes
│   ├── service/         # Business Logic
│   ├── utils/           # Utilities
│   ├── mail/            # Email service
│   └── server.js        # Entry point
├── public/
│   └── uploads/         # Uploaded files
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── api/             # API calls
│   ├── assets/          # Images, static files
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── features/        # Feature-based modules
│   ├── hooks/           # Custom hooks
│   ├── layouts/         # Layout components
│   ├── routes/          # Routing configuration
│   ├── services/        # Service layers
│   ├── styles/          # CSS files
│   ├── utility/         # Utilities
│   ├── utils/           # Helper functions
│   ├── App.js           # Main app component
│   └── index.js         # Entry point
├── public/              # Public assets
└── package.json
```

---

## 🔒 BẢO MẬT

### Authentication & Authorization
- JWT với access token và refresh token
- Token rotation cho refresh token
- Role-based access control (RBAC)
- Protected routes cho từng vai trò
- Session management
- Login attempt tracking
- Password hashing với bcryptjs

### Security Features
- Email verification
- Password reset với token
- Google OAuth integration
- CORS configuration
- Input validation với express-validator
- File upload validation
- Blacklist management

---

## 📊 TÍNH NĂNG CHÍNH

### 1. Quản lý Đặt Lịch
- Đặt lịch khám với bác sĩ
- Đặt lịch khám tại phòng khám
- Quản lý slot (khung giờ)
- Hủy/Thay đổi lịch hẹn
- Xác nhận lịch hẹn
- Lịch sử cuộc hẹn
- Hỗ trợ đặt lịch cho người cao tuổi (thông tin người thân)

### 2. Quản lý Bác Sĩ
- Đăng ký bác sĩ
- Quản lý thông tin bác sĩ
- Quản lý chuyên khoa
- Quản lý giấy phép hành nghề
- Top bác sĩ
- Tìm kiếm bác sĩ
- Lọc theo chuyên khoa, địa điểm

### 3. Quản lý Phòng Khám
- Đăng ký phòng khám
- Duyệt phòng khám (Admin System)
- Quản lý thông tin phòng khám
- Quản lý bác sĩ trong phòng khám
- Quản lý trợ lý
- Tìm kiếm phòng khám

### 4. Quản lý Hồ Sơ Bệnh Án
- Tạo và quản lý hồ sơ bệnh án
- Yêu cầu truy cập hồ sơ
- Quản lý triệu chứng, chẩn đoán
- Quản lý đơn thuốc
- Ghi chú và tệp đính kèm
- Lịch sử khám bệnh

### 5. Quản lý Khiếu Nại
- Tạo khiếu nại
- Quản lý khiếu nại (Admin)
- Xử lý khiếu nại

### 6. Thông Báo
- Thông báo hệ thống
- Thông báo đặt lịch
- Thông báo xác nhận
- Thông báo hủy lịch

### 7. Phản Hồi
- Phản hồi từ bệnh nhân
- Phản hồi ẩn danh
- Xem phản hồi

### 8. Quản lý Địa Điểm
- Quản lý tỉnh/thành phố
- Quản lý phường/xã
- Tìm kiếm địa điểm

### 9. Quản lý Tài Khoản
- Đăng ký/Đăng nhập
- Quên mật khẩu/Đặt lại mật khẩu
- Đổi mật khẩu
- Quản lý profile
- Quản lý tài khoản (Admin)
- Blacklist tài khoản

---

## 🚀 TRẠNG THÁI DỰ ÁN

### ✅ Đã hoàn thành
- [x] Cấu trúc dự án backend và frontend
- [x] Authentication & Authorization (JWT, Google OAuth)
- [x] User management (5 vai trò)
- [x] Doctor management
- [x] Clinic management
- [x] Appointment booking system
- [x] Medical records management
- [x] Notification system
- [x] Location management
- [x] File upload
- [x] Email service
- [x] Accessibility features
- [x] First time guide
- [x] Swagger API documentation
- [x] Complaint management
- [x] Feedback system
- [x] Blacklist management
- [x] Admin dashboards
- [x] Patient profile
- [x] Doctor profile
- [x] Assistant features
- [x] Admin clinic features
- [x] Admin system features

### 🔄 Đang phát triển
- [ ] Testing (Unit tests, Integration tests)
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Documentation updates

### 📝 Cần làm/Cải thiện
- [ ] Thêm unit tests cho backend
- [ ] Thêm unit tests cho frontend
- [ ] Integration tests
- [ ] E2E tests
- [ ] Error logging system (Winston, Sentry)
- [ ] Rate limiting
- [ ] API versioning
- [ ] Caching (Redis)
- [ ] Real-time notifications (WebSocket/Socket.io)
- [ ] Payment integration
- [ ] SMS notifications
- [ ] Multi-language support (i18n)
- [ ] PWA support
- [ ] Mobile responsive improvements
- [ ] SEO optimization
- [ ] Analytics integration
- [ ] Backup & recovery system
- [ ] Monitoring & alerting
- [ ] Load testing
- [ ] Security audit
- [ ] Code documentation (JSDoc)
- [ ] API rate limiting
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Code splitting

---

## 🐛 VẤN ĐỀ ĐÃ BIẾT (Known Issues)

1. **Duplicate routes in server.js** - Có một số routes bị trùng lặp (lines 48-67)
2. **Environment variables** - Cần file .env.example để hướng dẫn cấu hình
3. **Error handling** - Cần cải thiện xử lý lỗi toàn diện
4. **Loading states** - Một số component chưa có loading state
5. **Validation** - Cần thêm validation phía client cho một số form
6. **Testing** - Chưa có test cases

---

## 📦 DEPENDENCIES CHÍNH

### Backend Dependencies
- express: ^4.21.2
- mongoose: ^8.18.3
- jsonwebtoken: ^9.0.2
- bcryptjs: ^3.0.2
- nodemailer: ^7.0.6
- multer: ^2.0.2
- express-validator: ^7.2.1
- swagger-jsdoc: ^6.2.8
- swagger-ui-express: ^5.0.1
- google-auth-library: ^10.4.0
- moment-timezone: ^0.6.0
- cors: ^2.8.5
- dotenv: ^16.6.1
- morgan: ^1.10.0
- uuid: ^8.3.2

### Frontend Dependencies
- react: ^19.1.1
- react-dom: ^19.1.1
- react-router-dom: ^7.8.2
- redux: ^5.0.1
- redux-thunk: ^3.1.0
- axios: ^1.11.0
- @mui/material: ^7.3.2
- bootstrap: ^5.3.8
- formik: ^2.4.6
- yup: ^1.7.0
- date-fns: ^4.1.0
- react-datepicker: ^8.7.0
- react-hot-toast: ^2.6.0
- react-toastify: ^11.0.5
- recharts: ^3.3.0
- framer-motion: ^12.23.24
- lucide-react: ^0.544.0
- @react-oauth/google: ^0.12.2
- tailwindcss: ^3.4.17

---

## 🔧 CẤU HÌNH & SETUP

### Backend Setup
1. Cài đặt dependencies: `npm install`
2. Tạo file `.env` với các biến môi trường:
   - `MONGO_URI` / `MONGODB_URI` - MongoDB connection string
   - `PORT` - Server port (default: 5000)
   - `JWT_SECRET` - JWT secret key
   - `JWT_REFRESH_SECRET` - JWT refresh secret key
   - `FRONTEND_ORIGIN` - Frontend URL (default: http://localhost:3000)
   - Email configuration (SMTP)
   - Google OAuth credentials
3. Chạy server: `npm run dev` hoặc `npm start`

### Frontend Setup
1. Cài đặt dependencies: `npm install`
2. Tạo file `.env` với các biến môi trường:
   - `REACT_APP_API_URL` - Backend API URL
   - `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth Client ID
3. Chạy ứng dụng: `npm start`

### Database Setup
- MongoDB database cần được cấu hình
- Các collection sẽ được tạo tự động khi chạy ứng dụng

---

## 📚 TÀI LIỆU THAM KHẢO

### API Documentation
- Swagger UI: `http://localhost:5000/docs`
- Swagger JSON: `http://localhost:5000/api-docs.json`

### External Services
- Google OAuth 2.0
- Email service (SMTP)
- File storage (local uploads folder)

---

## 👥 NHÓM PHÁT TRIỂN

*Cần cập nhật thông tin nhóm phát triển*

---

## 📅 LỊCH SỬ CẬP NHẬT

### Version 1.0.0 (Current)
- Initial release
- Core features implemented
- All user roles functional
- Accessibility features added
- API documentation with Swagger

---

## 📝 GHI CHÚ

1. **File Upload**: Hiện tại lưu trữ file ở thư mục `backend/public/uploads`. Nên cân nhắc sử dụng cloud storage (AWS S3, Cloudinary) cho production.

2. **Email Service**: Cần cấu hình SMTP server để gửi email. Có thể sử dụng Gmail, SendGrid, hoặc các dịch vụ email khác.

3. **Google OAuth**: Cần đăng ký OAuth application trên Google Cloud Console và cấu hình Client ID.

4. **Database**: MongoDB cần được cấu hình và kết nối. Có thể sử dụng MongoDB Atlas cho production.

5. **Security**: Nên thêm các biện pháp bảo mật bổ sung như:
   - Rate limiting
   - Helmet.js
   - Input sanitization
   - SQL injection prevention (nếu có)
   - XSS protection

6. **Testing**: Cần thêm test cases để đảm bảo chất lượng code.

7. **Documentation**: Cần cập nhật tài liệu API và user guide.

8. **Deployment**: Cần cấu hình cho production environment:
   - Environment variables
   - Database backup
   - Logging
   - Monitoring
   - Error tracking

---

## 🔗 LIÊN KẾT HỮU ÍCH

- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Swagger Documentation](https://swagger.io/docs/)

---

**Cập nhật lần cuối:** $(date)
**Người cập nhật:** *Cần cập nhật*
**Phiên bản:** 1.0.0

