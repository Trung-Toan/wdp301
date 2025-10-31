const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // <-- THÊM DÒNG NÀY

// Đường dẫn thư mục lưu trữ
const uploadDir = path.resolve(__dirname, '../../public/uploads');

// 1. Đảm bảo thư mục 'uploads' tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Cấu hình nơi lưu trữ và tên file (DiskStorage)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Thư mục lưu file
    },

    // --- THAY ĐỔI CHÍNH NẰM Ở ĐÂY ---
    filename: function (req, file, cb) {
        // Lấy phần mở rộng của file gốc (ví dụ: .png, .pdf)
        const extension = path.extname(file.originalname);
        
        // Tạo tên file mới bằng UUID v4 và giữ lại phần mở rộng
        const newFileName = `${uuidv4()}${extension}`;
        
        cb(null, newFileName);
    }
    // --- KẾT THÚC THAY ĐỔI ---
});

// 3. Cấu hình bộ lọc file (FileFilter) - Giữ nguyên
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF) và PDF.'), false);
    }
};

// 4. Khởi tạo và export middleware upload - Giữ nguyên
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn 10MB
});

module.exports = upload;