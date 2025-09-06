const BASE_URL = "http://localhost:5000/api";


// api for user
export const AUTHEN_API = {
  LOGIN: `${BASE_URL}/user/login`,
  FINDEMAIL: `${BASE_URL}/user/find_email`,
  FORGOTPASSWORD:`${BASE_URL}/user/forgot_password`,
};
