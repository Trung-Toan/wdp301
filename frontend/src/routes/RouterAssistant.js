import React, { memo } from "react";
import { Routes, Route } from "react-router-dom";
import AssistantLayout from "../layouts/AssistantLayout";
import AssistantDashboard from "../features/assistant/AssistantDashboard";
import SlotSchedule from "../features/assistant/SlotSchedule";
import PatientList from "../features/assistant/PatientList";
import ApproveAppointment from "../features/assistant/ApproveAppointment";

const AssistantRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AssistantLayout />}>
        <Route index element={<AssistantDashboard />} />
        <Route path="dashboard" element={<AssistantDashboard />} />
        <Route path="slot-schedule" element={<SlotSchedule />} />
        <Route path="appointments" element={<ApproveAppointment />} />
        <Route path="patients" element={<PatientList />} />
      </Route>
    </Routes>
  );
};

export default memo(AssistantRoutes);


