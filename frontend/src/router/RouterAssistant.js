import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppointmentsList from "../features/assistant/pages/AppointmentsList";
import AppointmentDetail from "../features/assistant/pages/AppointmentDetail";

export default function RouterAssistant() {
  return (
    <Routes>
      <Route
        path="/assistant"
        element={<Navigate to="/assistant/appointments" replace />}
      />
      <Route path="/assistant/appointments" element={<AppointmentsList />} />
      <Route
        path="/assistant/appointments/:id"
        element={<AppointmentDetail />}
      />
    </Routes>
  );
}
