import { Route, Routes } from "react-router-dom";
import ClinicAdminLayout from "../../layouts/ClinicAdminLayout";
import ClinicDashboard from "../../features/admin-clinic/ClinicDashboard";
import DoctorManagement from "../../features/admin-clinic/DoctorManagement";
import AssistantManagement from "../../features/admin-clinic/AssistantManagement";
import ClinicCreation from "../../features/admin-clinic/ClinicCreate";
import ApproveDoctorLicenses from "../../features/admin-clinic/ApproveDoctorLicenses";
import AnonymousFeedback from "../../features/admin-clinic/AnonymousFeedback";
import BlacklistDetails from "../../features/admin-clinic/BlacklistDetails";
import OverloadAlerts from "../../features/admin-clinic/OverloadAlerts";

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
        <Route path="feedback" element={<AnonymousFeedback />} />
        <Route path="blacklist" element={<BlacklistDetails />} />
        <Route path="overload-alerts" element={<OverloadAlerts />} />
      </Route>
    </Routes>
  );
}
