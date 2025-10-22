// src/routes/AllRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { userRoutes } from "./modules/user.routes";
import { doctorRoutes } from "./modules/doctor.routes";
import { assistantRoutes } from "./modules/assistant.routes";
import { ownerRoutes } from "./modules/owner.routes";
import { patientsRoutes } from "./modules/patients.routes";

export default function AllRouter() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            {patientsRoutes}
            {userRoutes}
            {doctorRoutes}
            {assistantRoutes}
            {ownerRoutes}
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}
