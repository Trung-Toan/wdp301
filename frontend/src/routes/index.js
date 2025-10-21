import { Routes, Route, Navigate } from "react-router-dom";
import RouterUser from "./RouterUser";
import RouterOwner from "./RouterOwner";
import RouterDoctor from "./RouterDoctor";
import DoctorLayout from "../layouts/DoctorLayout";

export default function AllRouter() {
    return (
        <Routes>
            {/* Khi vào "/", tự động chuyển sang /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Các nhóm route */}
            <Route path="/*" element={<RouterUser />} />
            <Route path="/owner/*" element={<RouterOwner />} />
            <Route path="/doctor/*" element={<RouterDoctor />} />
            <Route path="/doctor-dashboard-test" element={<DoctorLayout />} />
        </Routes>
    );
}
