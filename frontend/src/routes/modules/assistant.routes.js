import { Route, Routes } from "react-router-dom";
import AssistantLayout from "../../layouts/AssistantLayout";
import AssistantDashboard from "../../features/assistant/AssistantDashboard";
import ShiftSchedule from "../../features/assistant/ShiftSchedule";

export default function AssistantRoutes() {
    return (
        <Routes>
            <Route path="/assistant" element={<AssistantLayout />}>
                <Route index element={<AssistantDashboard />} />
                <Route path="dashboard" element={<AssistantDashboard />} />
                <Route path="shift-schedule" element={<ShiftSchedule />} />
            </Route>
        </Routes>

    );
}
