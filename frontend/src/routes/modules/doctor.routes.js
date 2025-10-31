// src/routes/modules/doctor.routes.jsx
import { Route, Routes } from "react-router-dom";
import DoctorLayout from "../../layouts/DoctorLayout";
import DoctorDashboard from "../../features/doctor/DoctorDashboard";
import AppointmentSchedule from "../../features/doctor/AppointmentSchedule";
import PatientList from "../../features/doctor/PatientList";
import PatientMedicalRecords from "../../features/doctor/PatientMedicalRecords";
import FeedbackView from "../../features/doctor/FeedbackView";
import AssistantManagement from "../../features/doctor/AssistantManagement";
import MedicalRecordRequests from "../../features/doctor/MedicalRecordRequests";
import DoctorProfile from "../../features/doctor/DoctorProfile";
import DoctorChangePassword from "../../features/doctor/DoctorChangePassword";

export default function doctorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DoctorLayout />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="appointments" element={<AppointmentSchedule />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="feedback" element={<FeedbackView />} />
        <Route path="medical-records" element={<PatientMedicalRecords />} />
        <Route path="record-requests" element={<MedicalRecordRequests />} />
        <Route path="assistants" element={<AssistantManagement />} />
        <Route path="change-password" element={<DoctorChangePassword />} />
      </Route>
    </Routes>
  );
}
