import axios from "axios";
import { AUTHEN_API } from "../../api";

export const loginUser = async (usernameOrEmail, password) => {
  try {
    // Kiểm tra xem input là email hay username
    const isEmail = usernameOrEmail.includes("@");
    const payload = isEmail 
      ? { email: usernameOrEmail, password }
      : { username: usernameOrEmail, password };
    
    const response = await axios.post(AUTHEN_API.LOGIN, payload);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed!" };
  }
};

export const registerUser = async (fullname, email, password, role) => {
  try {
    const response = await axios.post(AUTHEN_API.REGISTER, {
      fullname,
      email,
      password,
      role: role || "customer",
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed!" };
  }
};

export const findEmail = async (email) => {
  try {
    const response = await axios.post(AUTHEN_API.FINDEMAIL, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Find email failed!" };
  }
};

export const forgotPassword = async (userId, password, rePassword) => {
  try {
    const response = await axios.put(AUTHEN_API.FORGOTPASSWORD, {
      userId,
      password,
      rePassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Find email failed!" };
  }
};

export const loginByGoogleAccount = async (idToken) => {
  try {
    const response = await axios.post(AUTHEN_API.LOGIN_BY_GOOGLE, {
      id_token: idToken, // phải là id_token để backend nhận đúng
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Google login failed!" };
  }
};
