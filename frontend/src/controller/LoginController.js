import axios from "axios";
import { AUTHEN_API } from "../api/api";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(AUTHEN_API.LOGIN, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed!" };
  }
};

export const registerUser = async (fullname, email, password, role) => {
  try {
    const response = await axios.post(AUTHEN_API.REGISTER, { fullname, email, password, role: role || "customer" });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed!" };
  }
}

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
    const response = await axios.put(AUTHEN_API.FORGOTPASSWORD, { userId, password, rePassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Find email failed!" };
  }
};

export const loginByGoogleAccount = async (token) => {
    try {
        const response = await axios.post(AUTHEN_API.LOGIN_BY_GOOGLE, { token });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Google login failed!" };
    }
}