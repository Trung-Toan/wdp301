// src/routes/modules/routeConfig.js
import UserRoutes from "./user.routes";
import DoctorRoutes from "./doctor.routes";
import AssistantRoutes from "./assistant.routes";
import OwnerRoutes from "./owner.routes";
import PatientsRoutes from "./patients.routes";
import AdminClinicRoutes from "./adminClinic.routes";
import RouterAdminSystem from "./adminSystem.routes";

export const routeConfig = [
  { path: "/*", element: <UserRoutes />, isPublic: true },
  { path: "/patient/*", element: <PatientsRoutes />, roles: ["PATIENT"] },
  { path: "/doctor/*", element: <DoctorRoutes />, roles: ["DOCTOR"] },
  { path: "/assistant/*", element: <AssistantRoutes />, roles: ["ASSISTANT"] },
  { path: "/owner/*", element: <OwnerRoutes />, roles: ["OWNER"] },
  {
    path: "/admin-clinic/*",
    element: <AdminClinicRoutes />,
    roles: ["ADMIN_CLINIC"],
  },
  { path: "/admin/*", element: <RouterAdminSystem />, roles: ["ADMIN_SYSTEM"] },
];
