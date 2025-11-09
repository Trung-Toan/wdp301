import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { setSessionStorage } from "../../hooks/useSessionStorage";
import { loginByGoogleAccount } from "../../api/auth/login/LoginController";
import { useAuth } from "../../hooks/useAuth";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Kiểm tra Google Client ID
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  useEffect(() => {
    if (!googleClientId) {
      console.error('❌ REACT_APP_GOOGLE_CLIENT_ID is not set!');
      setError('Google Client ID chưa được cấu hình');
    } else {
      console.log('✅ Google Client ID found:', googleClientId.substring(0, 20) + '...');
    }
  }, [googleClientId]);

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
      setIsLoading(false);
    },
    onError: (error) => {
      Swal.fire("Lỗi", error.message || "Google login failed!", "error");
      setIsLoading(false);
    },
  });

  // Khi Google trả credential thành công
  const handleGoogleLogin = (credentialResponse) => {
    console.log('✅ Google login success, credential received');
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      console.error('❌ No credential in response');
      Swal.fire("Lỗi", "Không nhận được thông tin từ Google", "error");
      return;
    }
    console.log('🔄 Starting login mutation...');
    setIsLoading(true);
    setError(null);
    googleLoginMutation.mutate(idToken);
  };


  // Nếu không có Client ID, hiển thị thông báo lỗi
  if (!googleClientId) {
    return (
      <div className="w-full p-4 bg-red-50 border-2 border-red-300 rounded-xl">
        <p className="text-red-700 text-sm font-semibold">
          ⚠️ Google Client ID chưa được cấu hình. Vui lòng liên hệ quản trị viên.
        </p>
      </div>
    );
  }

  // Sử dụng cách đơn giản hơn: hiển thị trực tiếp Google button với custom styling
  return (
    <div className="w-full">
      {/* Error message */}
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-300 rounded text-blue-700 text-sm flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Đang xử lý đăng nhập Google...</span>
        </div>
      )}

      {/* Google Login Button - hiển thị trực tiếp với wrapper để style */}
      <div className="w-full flex justify-center">
        <div 
          className="w-full"
          style={{
            opacity: isLoading ? 0.6 : 1,
            pointerEvents: isLoading ? 'none' : 'auto'
          }}
        >
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={(error) => {
              console.error('❌ Google login error:', error);
              Swal.fire("Lỗi", "Google login thất bại. Vui lòng thử lại.", "error");
              setIsLoading(false);
              setError('Google login thất bại: ' + (error?.error || 'Unknown error'));
            }}
            useOneTap={false}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
