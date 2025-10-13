import React from "react";
import { Route } from "react-router-dom";
import AssistantLayout from "../layouts/AssistantLayout";
import AssistantDashboard from "../features/assistant/pages/AssistantDashboard";

export const assistantRoutes = [
  <Route key="assistant-root" path="/assistant/*" element={<AssistantLayout />}>
    <Route index element={<AssistantDashboard />} />
    {/* thêm các route con cho assistant ở đây, ví dụ:
        <Route path="patients" element={<AssistantPatients />} />
    */}
  </Route>,
];

export default assistantRoutes;
