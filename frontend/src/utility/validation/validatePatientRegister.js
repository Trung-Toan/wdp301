// src/utils/validation/validatePatientRegister.js
import { isEmailValid, isPhoneValid, isPasswordStrong } from "./validationHelpers";

export const validatePatientRegister = (data) => {
    const errors = {};

    if (!data.username.trim()) errors.username = "Tên đăng nhập không được để trống.";
    if (!data.email.trim()) errors.email = "Email không được để trống.";
    else if (!isEmailValid(data.email)) errors.email = "Email không hợp lệ.";

    if (!data.phone.trim()) errors.phone = "Số điện thoại không được để trống.";
    else if (!isPhoneValid(data.phone)) errors.phone = "Số điện thoại không hợp lệ.";

    if (!data.password) errors.password = "Mật khẩu không được để trống.";
    else if (!isPasswordStrong(data.password)) errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";

    if (data.password !== data.confirmPassword)
        errors.confirmPassword = "Mật khẩu xác nhận không khớp.";

    if (!data.fullName.trim()) errors.fullName = "Họ và tên không được để trống.";

    if (!data.dob) errors.dob = "Ngày sinh không được để trống.";

    if (!data.gender) errors.gender = "Vui lòng chọn giới tính.";

    if (!data.address.trim()) errors.address = "Địa chỉ không được để trống.";

    return errors;
};
