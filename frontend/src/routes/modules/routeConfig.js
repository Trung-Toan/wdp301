// src/routes/modules/routeConfig.js
import UserRoutes from "./user.routes";
import DoctorRoutes from "./doctor.routes";
import AssistantRoutes from "./assistant.routes";
import OwnerRoutes from "./owner.routes";
import PatientsRoutes from "./patients.routes";

export const routeConfig = [
  { path: "/*", element: <UserRoutes />, isPublic: true },
  { path: "/patient/*", element: <PatientsRoutes />, roles: ["PATIENT"] },
  { path: "/doctor/*", element: <DoctorRoutes />, roles: ["DOCTOR"] },
  { path: "/assistant/*", element: <AssistantRoutes />, roles: ["ASSISTANT"] },
  { path: "/owner/*", element: <OwnerRoutes />, roles: ["OWNER"] },
];
