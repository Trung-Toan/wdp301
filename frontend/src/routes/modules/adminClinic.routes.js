import { Route, Routes } from "react-router-dom";
import ClinicAdminLayout from "../../layouts/ClinicAdminLayout";
import ClinicDashboard from "../../features/admin-clinic/ClinicDashboard";
import DoctorManagement from "../../features/admin-clinic/DoctorManagement";
import AssistantManagement from "../../features/admin-clinic/AssistantManagement";
import ClinicCreation from "../../features/admin-clinic/ClinicCreate";
import ClinicList from "../../features/admin-clinic/ClinicList";
import ClinicEdit from "../../features/admin-clinic/ClinicEdit";
import ApproveDoctorLicenses from "../../features/admin-clinic/ApproveDoctorLicenses";
import AnonymousFeedback from "../../features/admin-clinic/AnonymousFeedback";
import BlacklistDetails from "../../features/admin-clinic/BlacklistDetails";

export default function adminClinicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ClinicAdminLayout />}>
        <Route index element={<ClinicDashboard />} />
        <Route path="dashboard" element={<ClinicDashboard />} />
        <Route path="clinics" element={<ClinicCreation />} />
        <Route path="clinic/list" element={<ClinicList />} />
        <Route path="clinic/edit/:clinicId" element={<ClinicEdit />} />
        <Route path="clinic/edit" element={<ClinicEdit />} />
        <Route path="manage-doctors" element={<DoctorManagement />} />
        <Route path="assistants" element={<AssistantManagement />} />
        <Route path="approve-licenses" element={<ApproveDoctorLicenses />} />
        <Route path="feedback" element={<AnonymousFeedback />} />
        <Route path="blacklist" element={<BlacklistDetails />} />
      </Route>
    </Routes>
  );
}
