import React, { memo } from "react";
import { Routes, Route } from "react-router-dom";
import AssistantLayout from "../layouts/AssistantLayout";
import AssistantDashboard from "../features/assistant/AssistantDashboard";
import ShiftSchedule from "../features/assistant/ShiftSchedule";
import PatientList from "../features/assistant/PatientList";
import ApproveAppointment from "../features/assistant/ApproveAppointment";

const AssistantRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AssistantLayout />}>
        <Route index element={<AssistantDashboard />} />
        <Route path="dashboard" element={<AssistantDashboard />} />
        {/* thêm các route con khác ở đây */}
        <Route path="shift-schedule" element={<ShiftSchedule />} />
        <Route path="appointments" element={<ApproveAppointment />} />
        <Route path="patients/*" element={<PatientList />} />
      </Route>
    </Routes>
  );
};

export default memo(AssistantRoutes);
