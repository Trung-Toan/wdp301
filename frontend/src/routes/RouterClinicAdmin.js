import { memo } from "react";
import { Route, Routes } from "react-router-dom";
import ClinicAdminLayout from "../layouts/ClinicAdminLayout";
// import ClinicDashboard from "../features/clinic-admin/ClinicDashboard";
// import DoctorManagement from "../features/clinic-admin/DoctorManagement";
import AssistantManagement from "../features/admin-clinic/AssistantManagement";
// import FeedbackViewer from "../features/clinic-admin/FeedbackViewer";
// import BlacklistManagement from "../features/clinic-admin/BlacklistManagement";
// import OverloadAlertsSystem from "../features/clinic-admin/OverloadAlertsSystem";

const RouterClinicAdmin = () => {
  return (
    <Routes>
      <Route path="/" element={<ClinicAdminLayout />}>
        {/* <Route index element={<ClinicDashboard />} />
        <Route path="dashboard" element={<ClinicDashboard />} />
        <Route path="doctors" element={<DoctorManagement />} />

        <Route path="feedback" element={<FeedbackViewer />} />
        <Route path="blacklist" element={<BlacklistManagement />} />
        <Route path="overload-alerts" element={<OverloadAlertsSystem />} /> */}
      <Route path="assistants" element={<AssistantManagement />} />
      </Route>
    </Routes>
  );
};

export default memo(RouterClinicAdmin);