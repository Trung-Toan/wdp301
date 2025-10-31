import { Route, Routes } from "react-router-dom";
import ClinicAdminLayout from "../../layouts/ClinicAdminLayout";
import ClinicDashboard from "../../features/admin-clinic/ClinicDashboard";
import DoctorManagement from "../../features/admin-clinic/DoctorManagement";
import AssistantManagement from "../../features/admin-clinic/AssistantManagement";
import ClinicCreation from "../../features/admin-clinic/ClinicCreate";
import ApproveDoctorLicenses from "../../features/admin-clinic/ApproveDoctorLicenses";

export default function adminClinicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ClinicAdminLayout />}>
        <Route index element={<ClinicDashboard />} />
        <Route path="dashboard" element={<ClinicDashboard />} />
        <Route path="clinics" element={<ClinicCreation />} />
        <Route path="manage-doctors" element={<DoctorManagement />} />
        <Route path="assistants" element={<AssistantManagement />} />
        <Route path="approve-licenses" element={<ApproveDoctorLicenses />} />
      </Route>
    </Routes>
  );
}
