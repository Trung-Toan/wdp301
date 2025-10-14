// src/utils/validation/validationHelpers.js
export const isEmailValid = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const isPhoneValid = (phone) => {
    const regex = /^(0|\+84)[0-9]{9}$/; // Ví dụ: 0912345678 hoặc +84912345678
    return regex.test(phone);
};

export const isPasswordStrong = (password) => {
    return password.length >= 6; // Bạn có thể mở rộng quy tắc
};
