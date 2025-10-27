// src/routes/modules/user.routes.jsx
import { Route, Routes } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import HomePage from "../../features/home/pages/HomePage";
import Register from "../../features/auth/RegisterForm";
import Login from "../../features/auth/Login";
import ForgotPassword from "../../features/auth/ForgotPassword";
import ResetPassword from "../../features/auth/ResetPassword";
import { BookingContent } from "../../features/customer/pages/Booking/booking";
import DoctorsListContent from "../../features/home/pages/DoctorPage/doctors-list-content";
import DoctorDetailPage from "../../features/home/pages/DoctorPage";
import SpecialtiesList from "../../features/home/pages/Specialties/specialties-list-content";
import SpecialtyDetail from "../../features/home/pages/Specialties/specialty-detail-content";
import FacilitiesList from "../../features/clinic/pages/facility-list-content";
import FacilityDetail from "../../features/clinic/pages/facility-detail-content";
import FacilityBooking from "../../features/clinic/pages/facility-booking-content";
import ClinicSearchPage from "../../features/clinic/pages/ClinicSearchPage";

export default function UserRoutes() {
    return (
        <Routes>
            <Route path="/" element={<UserLayout />}>
                <Route path="home" element={<HomePage />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot_password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="home/doctordetail/:id/booking" element={<BookingContent />} />
                <Route path="home/doctorlist" element={<DoctorsListContent />} />
                <Route path="home/doctordetail/:id" element={<DoctorDetailPage />} />
                <Route path="home/specialty" element={<SpecialtiesList />} />
                <Route path="home/specialty/detail/:id" element={<SpecialtyDetail />} />
                <Route path="home/facility" element={<FacilitiesList />} />
                <Route path="home/facilities/:id" element={<FacilityDetail />} />
                <Route path="home/booking/facility" element={<FacilityBooking />} />
                <Route path="clinics/search" element={<ClinicSearchPage />} />
                <Route path="clinics/:id" element={<FacilityDetail />} />
            </Route>
        </Routes>
    );
}
