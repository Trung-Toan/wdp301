const dashboardService = require("../../service/admin_system/dashboard.service");

/**
 * GET /admin-system/dashboard/stats
 * Lấy thống kê dashboard cho admin system
 */
exports.getDashboardStats = async (req, res) => {
    try {
        console.log('📥 GET /admin-system/dashboard/stats - Request received');
        const stats = await dashboardService.getDashboardStats();
        console.log('✅ GET /admin-system/dashboard/stats - Success');
        return res.json({
            ok: true,
            data: stats
        });
    } catch (error) {
        console.error('❌ Error getting dashboard stats:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to get dashboard stats'
        });
    }
};

