import { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "../features/home/components/Header";
import Footer from "../features/home/components/Footer";



const UserLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header luôn trên cùng */}
            <Header />

            {/* Nội dung chính */}
            <main className="flex-1 container mx-auto px-4 py-6 mt-4">
                <Outlet />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default memo(UserLayout);
