const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");
const Clinic = require("../../model/clinic/Clinic");
const Appointment = require("../../model/appointment/Appointment");
const Complaint = require("../../model/appointment/Complaint");

/**
 * Lấy thống kê tổng quan cho dashboard
 * @returns {Object} Dashboard stats
 */
exports.getDashboardStats = async () => {
    try {
        // Tính toán thời gian (hôm nay, tháng này, tháng trước)
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Tổng người dùng (PATIENT role)
        const [totalUsers, totalUsersLastMonth] = await Promise.all([
            Account.countDocuments({ role: "PATIENT" }),
            Account.countDocuments({ 
                role: "PATIENT",
                createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd }
            })
        ]);

        // 2. Tổng phòng khám (ACTIVE status)
        const [totalClinics, totalClinicsLastMonth] = await Promise.all([
            Clinic.countDocuments({ status: "ACTIVE" }),
            Clinic.countDocuments({ 
                status: "ACTIVE",
                createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd }
            })
        ]);

        // 3. Lịch khám hôm nay
        const todayAppointments = await Appointment.countDocuments({
            scheduled_date: { $gte: todayStart, $lt: todayEnd },
            status: { $in: ["SCHEDULED", "APPROVE", "COMPLETED"] }
        });

        // Lịch khám cùng ngày tháng trước (để tính % change)
        const lastMonthSameDay = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastMonthSameDayEnd = new Date(lastMonthSameDay);
        lastMonthSameDayEnd.setDate(lastMonthSameDayEnd.getDate() + 1);
        
        const lastMonthSameDayAppointments = await Appointment.countDocuments({
            scheduled_date: { $gte: lastMonthSameDay, $lt: lastMonthSameDayEnd },
            status: { $in: ["SCHEDULED", "APPROVE", "COMPLETED"] }
        });

        // 4. Khiếu nại chưa xử lý (PENDING + IN_REVIEW)
        const pendingComplaints = await Complaint.countDocuments({
            status: { $in: ["PENDING", "IN_REVIEW"] }
        });

        // Khiếu nại chưa xử lý tháng trước
        const lastMonthPendingComplaints = await Complaint.countDocuments({
            status: { $in: ["PENDING", "IN_REVIEW"] },
            createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd }
        });

        // Tính % change
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const usersChange = calculateChange(totalUsers, totalUsersLastMonth);
        const clinicsChange = calculateChange(totalClinics, totalClinicsLastMonth);
        const appointmentsChange = calculateChange(todayAppointments, lastMonthSameDayAppointments);
        const complaintsChange = calculateChange(pendingComplaints, lastMonthPendingComplaints);

        // 5. Thống kê người dùng và phòng khám theo tháng (6 tháng gần nhất)
        const userStats = [];
        const clinicStats = [];
        
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            
            const [usersInMonth, clinicsInMonth] = await Promise.all([
                Account.countDocuments({ 
                    role: "PATIENT",
                    createdAt: { $gte: monthStart, $lt: monthEnd }
                }),
                Clinic.countDocuments({ 
                    status: "ACTIVE",
                    createdAt: { $gte: monthStart, $lt: monthEnd }
                })
            ]);

            userStats.push({
                month: (now.getMonth() - i + 1).toString(),
                users: usersInMonth,
            });

            clinicStats.push({
                month: (now.getMonth() - i + 1).toString(),
                clinics: clinicsInMonth,
            });
        }

        // 6. Thống kê khiếu nại (pie chart)
        const [resolvedComplaints, inReviewComplaints, pendingComplaintsOnly] = await Promise.all([
            Complaint.countDocuments({ status: "RESOLVED" }),
            Complaint.countDocuments({ status: "IN_REVIEW" }),
            Complaint.countDocuments({ status: "PENDING" })
        ]);

        // 7. Thống kê lịch khám theo ngày (6 ngày gần nhất)
        const bookingStatsPromises = [];
        for (let i = 5; i >= 0; i--) {
            const dayStart = new Date(now);
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            bookingStatsPromises.push(
                Appointment.countDocuments({
                    scheduled_date: { $gte: dayStart, $lt: dayEnd },
                    status: { $in: ["SCHEDULED", "APPROVE", "COMPLETED"] }
                }).then(bookings => ({
                    name: dayStart.getDate().toString(),
                    bookings: bookings
                }))
            );
        }
        const bookingStats = await Promise.all(bookingStatsPromises);

        return {
            stats: {
                totalUsers: {
                    value: totalUsers.toLocaleString("vi-VN"),
                    change: `${usersChange >= 0 ? "+" : ""}${usersChange}% so với tháng trước`
                },
                totalClinics: {
                    value: totalClinics.toLocaleString("vi-VN"),
                    change: `${clinicsChange >= 0 ? "+" : ""}${clinicsChange}% so với tháng trước`
                },
                todayAppointments: {
                    value: todayAppointments.toLocaleString("vi-VN"),
                    change: `${appointmentsChange >= 0 ? "+" : ""}${appointmentsChange}% so với tháng trước`
                },
                pendingComplaints: {
                    value: pendingComplaints.toLocaleString("vi-VN"),
                    change: `${complaintsChange >= 0 ? "+" : ""}${complaintsChange}% so với tháng trước`
                }
            },
            charts: {
                userStats: userStats.map((stat, index) => ({
                    month: stat.month,
                    users: stat.users,
                    clinics: clinicStats[index]?.clinics || 0
                })),
                complaintData: [
                    { name: "Đã xử lý", value: resolvedComplaints },
                    { name: "Đang chờ", value: pendingComplaintsOnly },
                    { name: "Đang xem xét", value: inReviewComplaints }
                ],
                bookingData: bookingStats
            }
        };
    } catch (error) {
        console.error("Error in getDashboardStats:", error);
        throw error;
    }
};

