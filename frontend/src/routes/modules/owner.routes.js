// src/routes/modules/owner.routes.jsx
import { Route, Routes } from "react-router-dom";
import HomeMangement from "../../layouts/HomeMangement";

export default function ownerRoutes() {
    return (
        <Routes>
            <Route path="/owner" element={<HomeMangement />}>
                {/* Add owner routes here */}
            </Route>
        </Routes>
    );
}
