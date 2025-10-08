import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import RouterUser from "./routes/RouterUser.js";
import { useEffect } from "react";
import { useSessionStorage } from "./hooks/useSessionStorage.js";
import RouterOwner from "./routes/RouterOwner.js";
import RouterDoctor from "./routes/RouterDoctor.js";
import DoctorLayout from "./layouts/DoctorLayout.js";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm lấy thông tin user từ sessionStorage
  const user = useSessionStorage("user");

  // Ánh xạ role với đường dẫn hợp lệ
  const roleRedirects = {
    customer: "/",
    owner: "/owner",
    doctor: "/doctor",
  };

  const checkLogin = () => {
    if (location.pathname === "/doctor-dashboard-test") {
      return;
    }

    if (
      location.pathname === "/doctor/dashboard" ||
      location.pathname === "/doctor/appointments"
    ) {
      return;
    }

    // if (!user) {
    //   // Chưa đăng nhập
    //   if (
    //     location.pathname !== "/home" &&
    //     location.pathname !== "/home/doctorlist" &&
    //     !location.pathname.startsWith("/home/doctordetail") && // Cho phép vào doctor detail
    //     location.pathname !== "/login" &&
    //     location.pathname !== "/find_email" &&
    //     location.pathname !== "/register" &&
    //     location.pathname !== "/forgot_password"
    //   ) {
    //     navigate("/home");
    //   }
    // } else {
    //   // Đã đăng nhập
    //   const validPath = roleRedirects[user.role];
    //   if (!validPath) {
    //     // Role không hợp lệ, có thể logout hoặc redirect về trang mặc định
    //     navigate("/home");
    //     sessionStorage.removeItem("user");
    //     return;
    //   }

    //   // Kiểm tra đường dẫn hiện tại có phù hợp với role không
    //   if (!location.pathname.startsWith(validPath) && location.pathname !== validPath) {
    //     navigate(validPath);
    //   }
    // }
  };

  useEffect(() => {
    checkLogin();

    // Lắng nghe sự kiện thay đổi sessionStorage (nếu cần)
    const handleStorageChange = () => checkLogin();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Chỉ chạy khi pathname thay đổi

  return (
    <Routes>
      <Route path="/*" element={<RouterUser />} />
      <Route path="/owner/*" element={<RouterOwner />} />
      <Route path="/doctor/*" element={<RouterDoctor />} />

      <Route path="/doctor-dashboard-test" element={<DoctorLayout />} />
    </Routes>
  );
}

export default App;
