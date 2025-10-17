import { memo } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../features/home/components/Header";
import Footer from "../features/home/components/Footer";

const UserLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#e8f9f4] via-white to-[#f8fbff] text-gray-800">
            {/* Header */}
            <Header />
            {/* Nội dung chính */}
            <motion.main
                className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <Outlet />
            </motion.main>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <Footer />
            </motion.div>
        </div>
    );
};

export default memo(UserLayout);
