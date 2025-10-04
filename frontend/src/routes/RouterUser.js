import { memo } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../features/auth/Login";
import FindEmail from "../features/auth/FindEmail";
import ForgetPassword from "../features/auth/ForgetPassword";
import Register from "../features/auth/Register";
import UserLayout from "../layouts/UserLayout";
import HomePage from "../features/home/pages/HomePage";
import { DoctorsListContent } from "../features/home/pages/DoctorPage/doctors-list-content";
import DoctorDetailPage from "../features/home/pages/DoctorPage";
import { BookingContent } from "../features/customer/pages/Booking/booking";
import { AppointmentsContent } from "../features/customer/pages/Appointment/appointment";
import SpecialtyDetail from "../features/home/pages/Specialties/specialty-detail-content";
import SpecialtiesList from "../features/home/pages/Specialties/specialties-list-content";


const RouterUser = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="home/doctordetail/:id/booking" element={<BookingContent />} />
        <Route path="home/doctorlist" element={<DoctorsListContent />} />
        <Route path="home/doctordetail/:id" element={<DoctorDetailPage />} />

        <Route path="home/appointment" element={<AppointmentsContent />} />
        <Route path="home/specialty" element={<SpecialtiesList />} />
        <Route path="home/specialty/detail/:slug" element={<SpecialtyDetail />} />

        <Route path="login" element={<Login />} />
        <Route path="find_email" element={<FindEmail />} />
        <Route path="forgot_password" element={<ForgetPassword />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
};

export default memo(RouterUser);