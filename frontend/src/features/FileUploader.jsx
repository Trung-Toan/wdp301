import React, { useState, useEffect } from 'react';
import axios from 'axios';

// URL API và URL Server File
const API_BASE_URL = 'http://localhost:5000/api/file';
const FILE_SERVER_URL = 'http://localhost:5000/uploads'; // Đường dẫn static

function FileUploader() {
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]); 
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Hàm gọi API để lấy danh sách file
    const fetchFiles = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all`); 
            setUploadedFiles(response.data.files || []);
        } catch (err) {
            console.error("Không thể tải danh sách file:", err);
            setError('Không thể tải danh sách file.');
        }
    };

    // Tải danh sách file khi component mount
    useEffect(() => {
        fetchFiles();
    }, []);

    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (!selectedFiles || selectedFiles.length === 0) {
            setError('Vui lòng chọn ít nhất một file.');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('myFile', selectedFiles[i]);
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/upload`, formData);
            setMessage(response.data.message);
            setSelectedFiles(null);
            document.getElementById('file-input').value = null;

            // Tải lại danh sách file sau khi upload thành công
            await fetchFiles(); 
        } catch (err) {
            console.error("Lỗi upload file: ", err);
            setError(err.response?.data?.error || 'Lỗi khi tải file lên.');
        }
    };

    // 5. HÀM NÂNG CẤP: Thêm link "Tải về"
    const renderFilePreview = (file) => {
        const fileName = file.fileName;
        
        // URL để XEM (trỏ đến file static)
        const fileUrl = `${FILE_SERVER_URL}/${fileName}`;
        
        // URL để TẢI VỀ (trỏ đến API download)
        const downloadUrl = `${API_BASE_URL}/download/${fileName}`;

        if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName)) {
            // Nếu là ảnh:
            return (
                <div>
                    <img 
                        src={fileUrl} 
                        alt={fileName} 
                        style={{ maxWidth: '100%', height: 'auto', maxHeight: '300px' }} 
                    />
                    <p>
                        {fileName} 
                        <span style={{ margin: '0 10px' }}>|</span>
                        {/* DÒNG MỚI: Thêm link tải về */}
                        <a href={downloadUrl}>Tải về</a>
                    </p>
                </div>
            );
        } else if (/\.pdf$/i.test(fileName)) {
            // Nếu là PDF:
            return (
                <div>
                    <object 
                        data={fileUrl} 
                        type="application/pdf" 
                        width="100%" 
                        height="500px"
                    >
                        <p>Trình duyệt của bạn không hỗ trợ xem PDF. 
                           <a href={fileUrl} target="_blank" rel="noopener noreferrer">Xem file PDF tại đây</a>
                        </p>
                    </object>
                    <p>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            {fileName} (Mở tab mới)
                        </a>
                        <span style={{ margin: '0 10px' }}>|</span>
                        {/* DÒNG MỚI: Thêm link tải về */}
                        <a href={downloadUrl}>Tải về</a>
                    </p>
                </div>
            );
        } else {
            // Các loại file khác (đã là link tải về)
            return (
                <p>
                    <a href={downloadUrl}>
                        {fileName} (Tải về)
                    </a>
                </p>
            );
        }
    };

    // 6. Giao diện (JSX)
    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            <h3>Upload nhiều file (ảnh hoặc PDF)</h3>
            <form onSubmit={handleSubmit}>
                <input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/gif,application/pdf"
                    multiple 
                />
                <button type="submit">Upload</button>
            </form>
            
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <hr style={{ margin: '30px 0' }} />

            <h3>Danh sách File đã tải lên</h3>
            <div className="file-list" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {uploadedFiles.length === 0 ? (
                    <p>Chưa có file nào.</p>
                ) : (
                    // Đảo ngược mảng để file mới nhất lên đầu
                    uploadedFiles.slice().reverse().map((file, index) => (
                        <div key={index} className="file-item" style={{ border: '1px solid #ddd', padding: '10px' }}>
                            {renderFilePreview(file)}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default FileUploader;