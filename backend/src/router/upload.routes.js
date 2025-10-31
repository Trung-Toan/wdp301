const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import middleware upload từ file utils
const upload = require('../utils/uploadfile.utils');
// Đường dẫn thư mục lưu trữ, ví dụ: 'public/uploads'
const uploadDir = path.resolve(__dirname, '../../public/uploads');
 
// 1. Endpoint (Route) để UPLOAD file
router.post('/upload', (req, res) => {
    
    // THAY ĐỔI Ở ĐÂY: từ .single('myFile') thành .array('myFile', 10)
    upload.array('myFile', 10)(req, res, function (err) { // 10 là số file tối đa
        if (err) {
            return res.status(400).send({ error: err.message });
        }

        // THAY ĐỔI Ở ĐÂY: req.file -> req.files
        // Kiểm tra xem có file nào được upload không
        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ error: 'Không có file nào được tải lên.' });
        }

        // THAY ĐỔI Ở ĐÂY: Trả về một mảng thông tin các file
        const filesInfo = req.files.map(file => ({
            fileName: file.filename,
            filePath: file.path
        }));

        res.status(200).send({
            message: `Tải lên ${req.files.length} file thành công!`,
            files: filesInfo // Trả về mảng files
        });
    });
});

// 2. Endpoint (Route) để DOWNLOAD file
router.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    // Đường dẫn phải khớp với nơi bạn lưu file trong 'upload.utils.js'
    const filePath = path.resolve(__dirname, '../../public/uploads', filename);

    res.download(filePath, (err) => {
        if (err) {
            if (err.code === "ENOENT") {
                 res.status(404).send({ error: 'File không tồn tại.' });
            } else {
                 res.status(500).send({ error: 'Lỗi khi tải file.' });
            }
        }
    });
});

router.get('/all', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).send({ error: 'Không thể đọc thư mục file.' });
        }
        // Lọc ra các file ẩn (ví dụ .DS_Store trên Mac)
        const visibleFiles = files.filter(file => !file.startsWith('.'));

        const fileData = visibleFiles.map(file => ({ fileName: file }));

        res.status(200).send({ files: fileData });
    });
});


module.exports = router;