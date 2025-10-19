import axios from "axios";
import { AUTHEN_API } from "../../api";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(AUTHEN_API.LOGIN, { email, password });
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed!" };
  }
};

<<<<<<< HEAD
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
=======
>>>>>>> 3947072ccd010b94e9a8e149a43ed0c6f654f875

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

<<<<<<< HEAD
export const loginByGoogleAccount = async (token) => {
  try {
    const response = await axios.post(AUTHEN_API.LOGIN_BY_GOOGLE, { token });
=======
export const loginByGoogleAccount = async (idToken) => {
  try {
    const response = await axios.post(AUTHEN_API.LOGIN_BY_GOOGLE, {
      id_token: idToken, // phải là id_token để backend nhận đúng
    });
    console.log(response.data);
>>>>>>> 3947072ccd010b94e9a8e149a43ed0c6f654f875
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Google login failed!" };
  }
};
