// utils/responseUtils.js
// ----------------------
// File này dùng để chuẩn hóa toàn bộ response trả về từ REST API.
// Giúp code backend Node.js/Express gọn, nhất quán và dễ maintain.


// Response chung cho các trường hợp thành công (GET, PUT, PATCH, v.v.)
const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    ok: true,   // Cho biết kết quả thành công hay thất bại
    message,         // Mô tả ngắn gọn kết quả
    data,            // Dữ liệu trả về (nếu có)
  });
};


// Response cho khi tạo mới thành công (POST)
const createdResponse = (res, data = null, message = "Created successfully") => {
  return res.status(201).json({
    ok: true,
    message,
    data,
  });
};


// Response cho khi cập nhật thành công (PUT/PATCH)
const updatedResponse = (res, data = null, message = "Updated successfully") => {
  return res.status(200).json({
    ok: true,
    message,
    data,
  });
};


// Response cho khi xóa thành công (DELETE)
const deletedResponse = (res, message = "Deleted successfully") => {
  return res.status(200).json({
    ok: true,
    message,
  });
};


// Response dành cho API có phân trang (GET list)
const paginatedResponse = ( res, data = [], pagination = {}, message = "Get list successfully" ) => {
  return res.status(200).json({
    ok: true,
    message,
    data,
    pagination: {
      // Trang hiện tại
      page: pagination.page || 1,
      // Số phần tử mỗi trang
      limit: pagination.limit || data.length,
      // Tổng số phần tử (tính từ DB)
      totalItems: pagination.totalItems || data.length,
      // Tổng số trang
      totalPages:
        pagination.totalPages ||
        Math.ceil((pagination.totalItems || data.length) / (pagination.limit || 1)),
    },
  });
};


// Response khi không tìm thấy tài nguyên (ví dụ: GET /users/:id mà id không tồn tại)
const notFoundResponse = (res, message = "Resource not found") => {
  return res.status(404).json({
    ok: false,
    message,
  });
};


// Response khi request không hợp lệ (thiếu field, validation fail, v.v.)
const badRequestResponse = (res, message = "Bad request") => {
  return res.status(400).json({
    ok: false,
    message,
  });
};


// Response khi chưa đăng nhập hoặc token không hợp lệ
const unauthorizedResponse = (res, message = "Unauthorized") => {
  return res.status(401).json({
    ok: false,
    message,
  });
};


// Response khi người dùng không có quyền truy cập tài nguyên
const forbiddenResponse = (res, message = "Forbidden") => {
  return res.status(403).json({
    ok: false,
    message,
  });
};


// Response cho lỗi server (exception, lỗi logic, v.v.)
const serverErrorResponse = (res, error = null, message = "Internal server error") => {
  return res.status(500).json({
    ok: false,
    message,
    // Trả thông tin lỗi chi tiết (nếu có)
    error: error?.message || error,
  });
};


// Xuất ra để có thể dùng ở mọi controller
module.exports = {
  successResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  paginatedResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
};
