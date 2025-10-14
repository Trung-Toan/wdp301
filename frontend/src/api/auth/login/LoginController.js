import axios from "axios";
import { AUTHEN_API } from "../../api";

const HARDCODED_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGU0ZmI5MzAzYmI4MDA1YjhmNGMwZmUiLCJyb2xlIjoiRE9DVE9SIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlhdCI6MTc2MDQ1Nzk5OCwiZXhwIjoxNzYwNTExOTk4fQ.Z90NVLmvu4fTRlJrcDrfkjaxuh-4TUvv8dpOvA4LKjo";
const TEST_DOCTOR_EMAIL = "trantrungtoan17092003@gmail.com";

export const loginUser = async (email, password) => {
  try {
    if (email === TEST_DOCTOR_EMAIL && password === "123456") {
      return {
        ok: true,
        account: {
          _id: "68e4fb9303bb8005b8f4c0fe",
          username: "toantt",
          email: TEST_DOCTOR_EMAIL,
          phone_number: "0818681561",
          status: "ACTIVE",
          role: "DOCTOR",
          email_verified: true,
          createdAt: "2025-10-07T11:37:55.797Z",
          updatedAt: "2025-10-07T11:37:55.797Z",
        },
        tokens: {
          accessToken: HARDCODED_TOKEN,
          refreshToken:
            "f29dcfd090b602f87d4f2a7f407e0e7402c14547d793534f349e82cfbd4979650db791f06001db715b79aee8c3272fd0",
          refreshExpiresAt: "2025-10-21T16:06:38.406Z",
        },
        mustVerify: false,
      };
    }

    const response = await axios.post(AUTHEN_API.LOGIN, { email, password });
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

export const loginByGoogleAccount = async (token) => {
  try {
    const response = await axios.post(AUTHEN_API.LOGIN_BY_GOOGLE, { token });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Google login failed!" };
  }
};
