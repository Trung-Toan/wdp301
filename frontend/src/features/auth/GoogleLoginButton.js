import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import { setSessionStorage } from "../../hooks/useSessionStorage";
import { loginByGoogleAccount } from "../../api/auth/login/LoginController";
import { useAuth } from "../../hooks/useAuth";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Mutation: gọi API login Google
  const googleLoginMutation = useMutation({
    mutationFn: (idToken) => loginByGoogleAccount(idToken),
    onSuccess: (data) => {
      if (data?.ok) {
        const token = data.tokens.accessToken;
        const account = data.account;
        const user = data.user;
        const patient = data.patient;

        console.log("🔍 GOOGLE LOGIN RESPONSE:", {
          account,
          user,
          patient,
          "patient._id": patient?._id,
          "patient.id": patient?.id
        });

        // Lưu thông tin user & tokens vào sessionStorage (using correct keys)
        setSessionStorage("token", token);
        setSessionStorage("account", account);
        setSessionStorage("refreshToken", data.tokens.refreshToken);
        setSessionStorage("user", user); // Set user for Header
        setSessionStorage("patient", patient); // Set patient for booking

        console.log("✅ Saved to sessionStorage:", {
          hasAccount: !!account,
          hasUser: !!user,
          hasPatient: !!patient,
          patientId: patient?._id || patient?.id
        });

        // Then call login to update auth context
        login(token);

        Swal.fire("Thành công", "Đăng nhập bằng Google thành công!", "success");

        // Navigate based on role
        if (account.role === "DOCTOR") {
          navigate("/doctor/dashboard");
        } else if (account.role === "ADMIN_CLINIC") {
          navigate("/clinic-admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        Swal.fire("Lỗi", data?.message || "Đăng nhập thất bại!", "error");
      }
    },
    onError: (error) => {
      Swal.fire("Lỗi", error.message || "Google login failed!", "error");
    },
  });

  // Khi Google trả credential thành công
  const handleGoogleLogin = (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      Swal.fire("Lỗi", "Không nhận được thông tin từ Google", "error");
      return;
    }
    googleLoginMutation.mutate(idToken);
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleLogin}
      onError={() => Swal.fire("Lỗi", "Google login thất bại", "error")}
    />
  );
};

export default GoogleLoginButton;
