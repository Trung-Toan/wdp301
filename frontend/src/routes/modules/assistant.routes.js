import { Route, Routes } from "react-router-dom";
import AssistantLayout from "../../layouts/AssistantLayout";
import AssistantDashboard from "../../features/assistant/AssistantDashboard";
import SlotSchedule from "../../features/assistant/SlotSchedule";
import ApproveAppointment from "../../features/assistant/ApproveAppointment";
import PatientList from "../../features/assistant/PatientList";

export default function AssistantRoutes() {
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
}
