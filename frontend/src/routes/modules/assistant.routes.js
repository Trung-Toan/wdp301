import { Route, Routes } from "react-router-dom";
import AssistantLayout from "../../layouts/AssistantLayout";
import AssistantDashboard from "../../features/assistant/AssistantDashboard";
import ShiftSchedule from "../../features/assistant/ShiftSchedule";
import ApproveAppointment from "../../features/assistant/ApproveAppointment";
import PatientList from "../../features/assistant/PatientList";

export default function AssistantRoutes() {
    return (
        <Routes>
            <Route path="/" element={<AssistantLayout />}>
                <Route index element={<AssistantDashboard />} />
                <Route path="dashboard" element={<AssistantDashboard />} />
                <Route path="shift-schedule" element={<ShiftSchedule />} />
                <Route path="appointments" element={<ApproveAppointment />} />
                <Route path="patients" element={<PatientList />} />
            </Route>
        </Routes>

    );
}
