/**
 * Utility functions for handling image URLs
 */

// Base URL cho static files (không có /api)
const getBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    // Nếu API_URL có /api, loại bỏ nó để lấy base URL cho static files
    return apiUrl.replace(/\/api\/?$/, '');
};

const STATIC_BASE_URL = getBaseUrl();

/**
 * Get full image URL from backend uploads folder
 * @param {string} imagePath - Image path or filename
 * @returns {string} Full URL to the image
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return null;
    }

    // If already a full URL (http/https), check if it has /api/uploads and fix it
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        // Fix URL nếu có /api/uploads thành /uploads
        if (imagePath.includes("/api/uploads/")) {
            return imagePath.replace("/api/uploads/", "/uploads/");
        }
        return imagePath;
    }

    // If starts with /uploads, just prepend base URL
    if (imagePath.startsWith("/uploads/")) {
        return `${STATIC_BASE_URL}${imagePath}`;
    }

    // If it's just a filename or relative path, add /uploads/ prefix
    // Remove leading slash if exists to avoid double slashes
    const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    return `${STATIC_BASE_URL}/uploads/${cleanPath}`;
};

/**
 * Get avatar URL with fallback
 * @param {string} avatarUrl - Avatar URL from API
 * @param {string} userId - User ID for fallback
 * @param {string} userName - User name for fallback
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (avatarUrl, userId = null, userName = null) => {
    // If avatar URL exists, use it
    if (avatarUrl) {
        return getImageUrl(avatarUrl);
    }

    // Fallback 1: Use pravatar with user ID
    if (userId) {
        return `https://i.pravatar.cc/150?u=${userId}`;
    }

    // Fallback 2: Use ui-avatars with user name
    if (userName) {
        const encodedName = encodeURIComponent(userName);
        return `https://ui-avatars.com/api/?name=${encodedName}&background=0ea5e9&color=fff&size=128`;
    }

    // Final fallback: Default avatar
    return "https://i.pravatar.cc/150?img=12";
};

