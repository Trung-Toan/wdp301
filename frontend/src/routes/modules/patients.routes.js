// src/routes/modules/user.routes.jsx
import { Route, Routes } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import ProfileContent from "../../features/customer/pages/Profile/ProfilePatient";
import NotificationListPage from "../../features/home/pages/Notifications/NotificationListPage";
import NotificationDetailPage from "../../features/home/pages/Notifications/NotificationDetailPage";
import RecordDetail from "../../features/customer/pages/Profile/components/RecordDetail";
import AppointmentsContent from "../../features/customer/pages/Appointment/appointment";

export default function patientsRoutes() {
    return (
        <Routes>
            <Route path="/" element={<UserLayout />}>
                <Route path="/profile" element={<ProfileContent />} />
                <Route path="/notifications" element={<NotificationListPage />} />
                <Route path="/notifications/:id" element={<NotificationDetailPage />} />
                <Route path="/records/:recordId" element={<RecordDetail />} />
                <Route path="/appointments" element={<AppointmentsContent />} />
            </Route>
        </Routes>
    );
}