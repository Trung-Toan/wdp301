import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { routeConfig } from "./modules/routeConfig";
import UnauthorizedPage from "../components/UnauthorizedPage";
import FileUploader from "../features/FileUploader";

export default function AllRouter() {
    return (
        <Routes>
            {/* Điều hướng mặc định */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/upload-file" element={<FileUploader/>} />
            {/* Duyệt qua cấu hình */}
            {routeConfig.map((route, index) => {
                if (route.isPublic) {
                    return <Route key={index} path={route.path} element={route.element} />;
                }

                return (
                    <Route
                        key={index}
                        path={route.path}
                        element={
                            <ProtectedRoute element={route.element} roles={route.roles} />
                        }
                    />
                );
            })}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}
