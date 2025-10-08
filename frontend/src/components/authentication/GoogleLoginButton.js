import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { loginByGoogleAccount } from "../../controller/LoginController";
import { setSessionStorage } from "../../utility/useSessionStorage";

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  // Mutation cho login bằng Google
  const googleLoginMutation = useMutation({
    mutationFn: (token) => loginByGoogleAccount(token),
    onSuccess: (data) => {
      setSessionStorage("token", data?.token);
      setSessionStorage("user", data?.user);
      Swal.fire("Success", "Login with Google success!", "success");
      navigate("/");
    },
    onError: (error) => {
      Swal.fire("Error", error.message || "Google login failed!", "error");
    },
  });

  // Callback khi login thành công
  const handleGoogleLogin = (credentialResponse) => {
    if (!credentialResponse?.credential) {
      Swal.fire("Error", "No credential received from Google", "error");
      return;
    }
    googleLoginMutation.mutate(credentialResponse.credential);
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleLogin}
      onError={() =>
        Swal.fire("Error", "Google login failed", "error")
      }
    />
  );
};

export default GoogleLoginButton;
