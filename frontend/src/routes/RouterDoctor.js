import { memo } from "react";
import { Route, Routes } from "react-router-dom";
import DoctorDashboard from "../features/doctor/DoctorDashboard";
import DoctorLayout from "../layouts/DoctorLayout";
import PatientList from "../features/doctor/PatientList";
import AppointmentSchedule from "../features/doctor/AppointmentSchedule";
import PatientMedicalRecords from "../features/doctor/PatientMedicalRecords";
import FeedbackView from "../features/doctor/FeedbackView";
import AssistantManagement from "../features/doctor/AssistantManagement";
// import DoctorRegistration from "../features/doctor/DoctorRegistration";
import MedicalRecordRequests from "../features/doctor/MedicalRecordRequests";
// import AbsenceNotification from "../features/doctor/AbsenceNotification";

const RouterDoctor = () => {
  return (
    <Routes>
      <Route path="/" element={<DoctorLayout />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<AppointmentSchedule />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="feedback" element={<FeedbackView />} />
        <Route path="medical-records" element={<PatientMedicalRecords />} />
<<<<<<< HEAD
        {/* <Route path="register" element={<DoctorRegistration />} />
=======
>>>>>>> main
        <Route path="record-requests" element={<MedicalRecordRequests />} />
        <Route path="assistants" element={<AssistantManagement />} />
        {/* <Route path="register" element={<DoctorRegistration />} />
        
        <Route path="absence" element={<AbsenceNotification />} /> */}
      </Route>
    </Routes>
  );
};

export default memo(RouterDoctor);
