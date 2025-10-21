const BASE_URL = process.env.REACT_APP_API_URL;

// api for user
export const AUTHEN_API = {
  LOGIN: `${BASE_URL}/auth/login`,
  FINDEMAIL: `${BASE_URL}/auth/request-password-reset`,
  FORGOTPASSWORD: `${BASE_URL}/auth/reset-password`,
  // REGISTER: `${BASE_URL}/user/register`,
  LOGIN_BY_GOOGLE: `${BASE_URL}/auth/google`,
};
