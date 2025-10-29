# 🔔 Hướng dẫn Hệ thống Thông báo

## ✨ Tính năng đã hoàn thành

### 1. **NotificationDropdown** (Header)
✅ Bell icon với badge số lượng chưa đọc
✅ Dropdown hiển thị 5 notifications gần nhất
✅ Auto-refresh mỗi 60 giây
✅ Click notification → Mark as read + Navigate
✅ Button "Xem tất cả thông báo"

### 2. **NotificationListPage** (Full Page)
✅ Hiển thị TẤT CẢ notifications
✅ Grouping theo ngày (Hôm nay, Hôm qua, Tuần này, etc.)
✅ Filter: Tất cả / Chưa đọc / Đã đọc
✅ Pagination với "Xem thêm"
✅ Mark as read on click
✅ Mark all as read
✅ Delete notification
✅ Responsive design
✅ Loading & Error states
✅ Empty states

---

## 🎯 Cách sử dụng

### **Header Dropdown:**

1. Click **bell icon** ở header
2. Xem 5 notifications mới nhất
3. Click notification → Đọc và chuyển trang
4. Click **"Xem tất cả thông báo"** → Full page

### **Full Page:**

1. Navigate to `/patient/notifications`
2. Xem tất cả notifications
3. Filter theo trạng thái
4. Click **"Đọc tất cả"** để mark all
5. Hover notification → Click **trash icon** để xóa
6. Click **"Xem thêm"** để load more

---

## 🔄 Quy trình hoạt động

```
1. User đặt lịch khám
   ↓
2. Backend tạo notification TỰ ĐỘNG
   ↓
3. Frontend auto-refresh (60s)
   ↓
4. Bell icon badge update
   ↓
5. User click bell → Xem notifications
   ↓
6. Click "Xem tất cả" → Full page
   ↓
7. Filter, mark as read, delete
```

---

## 📂 Files Structure

```
frontend/src/
├── features/
│   ├── home/
│   │   ├── components/
│   │   │   ├── Header.js                  ← Bell icon
│   │   │   └── NotificationDropdown.js    ← Dropdown (5 notifications)
│   │   └── pages/
│   │       └── Notifications/
│   │           └── NotificationListPage.js ← Full page (tất cả)
│   │
├── hooks/
│   └── useNotifications.js                ← Custom hook
│
├── api/
│   └── notification/
│       └── notificationApi.js             ← API calls
│
└── utils/
    └── notificationHelpers.js             ← Helper functions
```

---

## 🎨 UI Components

### **NotificationDropdown:**
- Width: 384px
- Max height: 400px
- Hiển thị: 5 notifications gần nhất
- Auto-refresh: 60 seconds
- Navigate: `/patient/notifications`

### **NotificationListPage:**
- Layout: Full page
- Sticky header với back button
- Filter tabs: Tất cả / Chưa đọc / Đã đọc
- Grouped by date
- Responsive: Mobile → Desktop
- Pagination: "Xem thêm" button

---

## 🎯 Features Chi tiết

### **1. Grouping theo ngày:**
```javascript
- Hôm nay
- Hôm qua
- Tuần này
- Tháng này
- Cũ hơn
```

### **2. Filter:**
```javascript
- Tất cả: Hiển thị tất cả
- Chưa đọc: Chỉ unread
- Đã đọc: Chỉ read
```

### **3. Actions:**
```javascript
- Click notification → Mark as read + Navigate
- Hover → Delete button xuất hiện
- "Đọc tất cả" → Mark all as read
- "Xem thêm" → Load more (pagination)
```

### **4. Visual States:**
```javascript
- Unread: Blue background + Blue dot
- Read: White background
- Hover: Shadow + Delete button
- Loading: Spinner
- Empty: Icon + Message
```

---

## 🔧 Customization

### **Change refresh interval:**
```javascript
// NotificationDropdown.js
useNotifications({
    refreshInterval: 30000  // 30 seconds
})
```

### **Change số lượng hiển thị:**
```javascript
// NotificationDropdown.js
const recentNotifications = notifications.slice(0, 10); // 10 thay vì 5
```

### **Change navigation path:**
```javascript
// NotificationDropdown.js
navigate("/custom/path");
```

---

## 📊 Data Flow

### **useNotifications Hook:**
```javascript
{
  notifications: Array,        // Danh sách notifications
  unreadCount: Number,         // Số chưa đọc
  loading: Boolean,            // Loading state
  error: String,               // Error message
  meta: Object,                // Pagination info
  markAsRead: Function,        // Mark 1 notification
  markAllAsRead: Function,     // Mark all
  deleteNotification: Function, // Delete 1
  loadMore: Function,          // Load next page
  refresh: Function,           // Refresh data
  hasMore: Boolean             // Còn data để load?
}
```

---

## 🚀 Best Practices

### **1. Auto-refresh:**
```javascript
// Header dropdown: Auto-refresh mỗi 60s
useNotifications({ refreshInterval: 60000 })

// Full page: Không auto-refresh (user control)
useNotifications({ refreshInterval: 0 })
```

### **2. Optimistic Updates:**
```javascript
// Mark as read → Update UI ngay, không đợi API
await markAsRead(notificationId);
// UI đã update → Better UX
```

### **3. Error Handling:**
```javascript
{error && (
  <div>
    <p>{error}</p>
    <button onClick={refresh}>Thử lại</button>
  </div>
)}
```

---

## 🐛 Troubleshooting

### **Không thấy notifications:**
1. Check backend running (port 5000)
2. Check token hợp lệ
3. Check MongoDB có data
4. Check console logs

### **Badge không update:**
1. Check auto-refresh interval
2. Check token payload (sub field)
3. Refresh page (F5)

### **Xem thêm không hoạt động:**
1. Check `hasMore` flag
2. Check `meta.totalPages`
3. Check API pagination

---

## ✅ Testing Checklist

### **Header Dropdown:**
- [ ] Bell icon hiển thị
- [ ] Badge đúng số unread
- [ ] Click → Dropdown mở
- [ ] 5 notifications hiển thị
- [ ] Click notification → Navigate
- [ ] "Xem tất cả" → Navigate to full page
- [ ] Auto-refresh mỗi 60s

### **Full Page:**
- [ ] Route `/patient/notifications` works
- [ ] All notifications hiển thị
- [ ] Grouped by date
- [ ] Filter hoạt động
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete works
- [ ] "Xem thêm" loads more
- [ ] Responsive trên mobile
- [ ] Loading state displays
- [ ] Empty state displays
- [ ] Error state + retry works

---

## 🎉 Success!

**Hệ thống notifications đã HOÀN TẤT!**

- ✅ Header dropdown with auto-refresh
- ✅ Full page with all features
- ✅ Filter, group, pagination
- ✅ Mark as read, delete
- ✅ Responsive design
- ✅ Loading & error states
- ✅ Beautiful UI/UX

**Happy coding! 🚀**

