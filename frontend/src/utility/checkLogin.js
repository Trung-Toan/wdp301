// src/utils/checkLogin.js
export const checkLogin = (location, navigate, user, roleRedirects) => {
    // Cho phép truy cập các route test đặc biệt
    if (
        location.pathname === "/doctor-dashboard-test" ||
        location.pathname === "/doctor/dashboard" ||
        location.pathname === "/doctor/appointments"
    ) {
        return;
    }

    // Nếu chưa đăng nhập
    if (!user) {
        if (
            location.pathname !== "/home" &&
            location.pathname !== "/home/doctorlist" &&
            !location.pathname.startsWith("/home/doctordetail") &&
            location.pathname !== "/login" &&
            location.pathname !== "/find_email" &&
            location.pathname !== "/register" &&
            location.pathname !== "/forgot_password"
        ) {
            navigate("/home");
        }
        return;
    }

    // Nếu đã đăng nhập
    const validPath = roleRedirects[user.role];
    if (!validPath) {
        sessionStorage.removeItem("user");
        navigate("/home");
        return;
    }

    if (!location.pathname.startsWith(validPath) && location.pathname !== validPath) {
        navigate(validPath);
    }
};
