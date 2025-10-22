import { memo } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../features/auth/Login";
import Register from "../features/auth/RegisterForm";
import UserLayout from "../layouts/UserLayout";
import HomePage from "../features/home/pages/HomePage";
import { DoctorsListContent } from "../features/home/pages/DoctorPage/doctors-list-content";
import DoctorDetailPage from "../features/home/pages/DoctorPage";
import { BookingContent } from "../features/customer/pages/Booking/booking";
import { AppointmentsContent } from "../features/customer/pages/Appointment/appointment";
import SpecialtyDetail from "../features/home/pages/Specialties/specialty-detail-content";
import SpecialtiesList from "../features/home/pages/Specialties/specialties-list-content";
import FacilitiesList from "../features/clinic/pages/facility-list-content";
import FacilityDetail from "../features/clinic/pages/facility-detail-content";
import FacilityBooking from "../features/clinic/pages/facility-booking-content";
import ProfileContent from "../features/customer/pages/Profile/ProfilePatient";
import NotificationListPage from "../features/home/pages/Notifications/NotificationListPage";
import NotificationDetailPage from "../features/home/pages/Notifications/NotificationDetailPage";
import RecordDetail from "../features/customer/pages/Profile/components/RecordDetail";
import ForgotPassword from "../features/auth/ForgotPassword";
import ResetPassword from "../features/auth/ResetPassword";


const RouterUser = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="home/profile" element={<ProfileContent />} />
        <Route path="home/notifications" element={<NotificationListPage />} />
        <Route path="home/notifications/:id" element={<NotificationDetailPage />} />

        <Route path="home/doctordetail/:id/booking" element={<BookingContent />} />
        <Route path="home/doctorlist" element={<DoctorsListContent />} />
        <Route path="home/doctordetail/:id" element={<DoctorDetailPage />} />

        <Route path="home/appointment" element={<AppointmentsContent />} />
        <Route path="home/specialty" element={<SpecialtiesList />} />
        <Route path="home/specialty/detail/:id" element={<SpecialtyDetail />} />


        <Route path="home/facility" element={<FacilitiesList />} />
        <Route path="home/facilities/:id" element={<FacilityDetail />} />
        <Route path="home/booking/facility" element={<FacilityBooking />} />

        <Route path="/patient/records/:recordId" element={<RecordDetail />} />

        <Route path="login" element={<Login />} />
        <Route path="forgot_password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
};

export default memo(RouterUser);