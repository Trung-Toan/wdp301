import { memo } from "react";
import { Route, Routes } from "react-router-dom";
import ClinicAdminLayout from "../layouts/ClinicAdminLayout";
import ClinicDashboard from "../features/admin-clinic/ClinicDashboard";
import DoctorManagement from "../features/admin-clinic/DoctorManagement";
import AssistantManagement from "../features/admin-clinic/AssistantManagement";

const RouterClinicAdmin = () => {
  return (
    <Routes>
      <Route path="/" element={<ClinicAdminLayout />}>
        <Route index element={<ClinicDashboard />} />
        <Route path="dashboard" element={<ClinicDashboard />} />
        <Route path="manage-doctors" element={<DoctorManagement />} />
        <Route path="assistants" element={<AssistantManagement />} />
      </Route>
    </Routes>
  );
};

export default memo(RouterClinicAdmin);
