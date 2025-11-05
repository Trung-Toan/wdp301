/**
 * Date and Time formatting utilities
 * Đảm bảo format thời gian nhất quán trong toàn bộ ứng dụng
 */

/**
 * Format date theo định dạng Việt Nam
 * @param {string|Date} date - Ngày cần format
 * @param {object} options - Options cho format
 * @returns {string} - Ngày đã format (ví dụ: "Thứ Hai, 15/01/2024")
 */
export const formatDate = (date, options = {}) => {
    if (!date) return "N/A";
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return "N/A";
        
        const defaultOptions = {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        };
        
        return dateObj.toLocaleDateString("vi-VN", { ...defaultOptions, ...options });
    } catch (error) {
        console.error("Error formatting date:", error);
        return "N/A";
    }
};

/**
 * Format date ngắn gọn (chỉ ngày/tháng/năm)
 * @param {string|Date} date - Ngày cần format
 * @returns {string} - Ngày đã format (ví dụ: "15/01/2024")
 */
export const formatDateShort = (date) => {
    if (!date) return "N/A";
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return "N/A";
        
        return dateObj.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return "N/A";
    }
};

/**
 * Format time theo định dạng 24 giờ (HH:mm)
 * @param {string|Date} time - Thời gian cần format
 * @param {object} options - Options cho format
 * @returns {string} - Thời gian đã format (ví dụ: "14:30")
 */
export const formatTime = (time, options = {}) => {
    if (!time) return "N/A";
    
    try {
        const timeObj = typeof time === 'string' ? new Date(time) : time;
        if (isNaN(timeObj.getTime())) return "N/A";
        
        const defaultOptions = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false // Luôn dùng 24 giờ
        };
        
        return timeObj.toLocaleTimeString("vi-VN", { ...defaultOptions, ...options });
    } catch (error) {
        console.error("Error formatting time:", error);
        return "N/A";
    }
};

/**
 * Format date và time cùng lúc
 * @param {string|Date} dateTime - Ngày giờ cần format
 * @param {object} dateOptions - Options cho date
 * @param {object} timeOptions - Options cho time
 * @returns {string} - Ngày giờ đã format (ví dụ: "Thứ Hai, 15/01/2024, 14:30")
 */
export const formatDateTime = (dateTime, dateOptions = {}, timeOptions = {}) => {
    if (!dateTime) return "N/A";
    
    try {
        const dateTimeObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
        if (isNaN(dateTimeObj.getTime())) return "N/A";
        
        const dateStr = formatDate(dateTimeObj, dateOptions);
        const timeStr = formatTime(dateTimeObj, timeOptions);
        
        return `${dateStr}, ${timeStr}`;
    } catch (error) {
        console.error("Error formatting dateTime:", error);
        return "N/A";
    }
};

/**
 * Format time range (khoảng thời gian)
 * @param {string|Date} startTime - Thời gian bắt đầu
 * @param {string|Date} endTime - Thời gian kết thúc
 * @returns {string} - Khoảng thời gian (ví dụ: "08:00 - 12:00")
 */
export const formatTimeRange = (startTime, endTime) => {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    
    if (start === "N/A" || end === "N/A") return "N/A";
    
    return `${start} - ${end}`;
};

/**
 * Format ISO time string thành HH:mm (dùng cho slot time)
 * @param {string} isoString - ISO time string (ví dụ: "2024-01-15T14:30:00.000Z")
 * @returns {string} - Thời gian format (ví dụ: "14:30")
 */
export const formatISOTime = (isoString) => {
    if (!isoString) return "N/A";
    
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "N/A";
        
        return formatTime(date);
    } catch (error) {
        console.error("Error formatting ISO time:", error);
        return "N/A";
    }
};

/**
 * Format date cho input type="date" (yyyy-MM-dd)
 * @param {string|Date} date - Ngày cần format
 * @returns {string} - Ngày format (ví dụ: "2024-01-15")
 */
export const formatDateForInput = (date) => {
    if (!date) return "";
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return "";
        
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Error formatting date for input:", error);
        return "";
    }
};

/**
 * Format time cho input type="time" (HH:mm)
 * @param {string|Date} time - Thời gian cần format
 * @returns {string} - Thời gian format (ví dụ: "14:30")
 */
export const formatTimeForInput = (time) => {
    if (!time) return "";
    
    try {
        const timeObj = typeof time === 'string' ? new Date(time) : time;
        if (isNaN(timeObj.getTime())) return "";
        
        const hours = String(timeObj.getHours()).padStart(2, '0');
        const minutes = String(timeObj.getMinutes()).padStart(2, '0');
        
        return `${hours}:${minutes}`;
    } catch (error) {
        console.error("Error formatting time for input:", error);
        return "";
    }
};

