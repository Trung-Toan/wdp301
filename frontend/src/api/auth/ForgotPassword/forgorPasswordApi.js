import axios from "axios";
import { AUTHEN_API } from "../../api";

// Tìm email để reset password
export const findEmailAndResetPassword = async (email) => {
    const response = await axios.post(AUTHEN_API.FINDEMAIL, { email });
    return response.data;
};

// Đặt lại mật khẩu
export const resetPassword = async (token, newPassword) => {
    const response = await axios.post(AUTHEN_API.FORGOTPASSWORD, { token, newPassword });
    return response.data;
};