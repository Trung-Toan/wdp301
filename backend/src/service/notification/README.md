# 🔔 Notification Service

## 📊 Cấu trúc Database

### Quan hệ giữa các Models:

```
Patient → user_id → User → account_id → Account
   ↓
Appointment
   ↓
Notification (recipient_id = Account._id)
```

### Chi tiết:

1. **Patient Model**
   - `user_id`: Reference to User
   - `patient_code`: Mã bệnh nhân

2. **User Model**
   - `account_id`: Reference to Account
   - `full_name`, `dob`, `gender`, etc.

3. **Account Model**
   - `email`, `password`, `role`, etc.
   - Đây là model dùng để đăng nhập

4. **Notification Model**
   - `recipient_id`: Reference to Account (người nhận)
   - `related_appointment`: Reference to Appointment
   - `related_patient`: Không cần vì có `related_appointment`

---

## ⚠️ Common Errors & Fixes

### Error: "Cannot populate path 'account_id' on Patient"

**Nguyên nhân:**
Patient model không có field `account_id`, mà có `user_id`.

**Sửa:**
```javascript
// ❌ SAI
const patient = await Patient.findById(id).populate("account_id");

// ✅ ĐÚNG
const patient = await Patient.findById(id).populate({
    path: "user_id",
    select: "account_id full_name"
});

// Sau đó lấy account_id
const accountId = patient.user_id.account_id;
```

---

## 🔍 Flow tạo Notification

```
1. User đặt lịch
   ↓
2. Create Appointment (trong book.service.js)
   ↓
3. Call createAppointmentNotification(appointmentData)
   ↓
4. Query Patient → populate User → get account_id
   ↓
5. Create Notification với recipient_id = account_id
   ↓
6. Patient nhận notification khi login (GET /api/notifications)
```

---

## 🚀 Usage

### Tạo notification khi đặt lịch:

```javascript
const { createAppointmentNotification } = require("./notification.service");

// Sau khi tạo appointment thành công
const populated = await Appointment.findById(appt._id)
    .populate("doctor_id")
    .populate("clinic_id")
    .populate("specialty_id");

await createAppointmentNotification(populated);
```

### Lấy notifications của user:

```javascript
// accountId từ req.user.id (JWT token)
const result = await notificationService.getNotifications(accountId, {
    page: 1,
    limit: 20,
    isRead: false // optional
});
```

---

## 📝 Notes

- **Notification không fail booking**: Nếu tạo notification lỗi, booking vẫn thành công
- **Account ID**: Notification luôn link tới Account (không phải User hay Patient)
- **Populate**: Cần populate nested: Patient → User → Account
- **Indexes**: Notification có indexes trên `recipient_id` và `is_read` để query nhanh

---

## 🐛 Debugging

### Check Patient structure:
```javascript
const patient = await Patient.findById(patientId).populate("user_id");
console.log(patient);
// {
//   _id: ...,
//   user_id: {
//     _id: ...,
//     account_id: ...,
//     full_name: "..."
//   }
// }
```

### Check if account_id exists:
```javascript
if (!patient.user_id?.account_id) {
    console.error("Missing account_id");
    return null;
}
```

### Check notification created:
```javascript
const notifs = await Notification.find({ recipient_id: accountId });
console.log("Notifications:", notifs.length);
```

---

## ✅ Tested Scenarios

- ✅ Đặt lịch thành công → Notification được tạo
- ✅ Patient không có user_id → Notification không tạo (không crash)
- ✅ User không có account_id → Notification không tạo (không crash)
- ✅ Populate nested works correctly
- ✅ Query notifications by account_id works
- ✅ Unread count accurate

---

## 🔮 Future Improvements

1. **Socket.io**: Real-time notifications
2. **FCM**: Push notifications cho mobile
3. **Email digest**: Gửi tổng hợp notifications
4. **SMS**: Nhắc nhở quan trọng
5. **Reminder**: Tự động tạo reminder trước 24h/1h

