const accountManagementService = require('../../service/admin_system/accountManagement.service');

/**
 * Lấy danh sách ADMIN_CLINIC với filter
 */
exports.getAdminClinicAccounts = async (req, res) => {
    try {
        console.log('📥 GET /admin-system/accounts - Request received');
        const { status, search, page = 1, limit = 10 } = req.query;

        const result = await accountManagementService.getAdminClinicAccounts({
            status,
            search,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        console.log('✅ GET /admin-system/accounts - Success');
        return res.json({
            ok: true,
            data: result
        });
    } catch (error) {
        console.error('❌ Error getting admin clinic accounts:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to get admin clinic accounts'
        });
    }
};

/**
 * Lấy danh sách ADMIN_CLINIC đang chờ phê duyệt (PENDING)
 */
exports.getPendingAdminClinicAccounts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await accountManagementService.getPendingAdminClinicAccounts({
            page: parseInt(page),
            limit: parseInt(limit)
        });

        return res.json({
            ok: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting pending admin clinic accounts:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to get pending admin clinic accounts'
        });
    }
};

/**
 * Phê duyệt ADMIN_CLINIC (PENDING -> ACTIVE)
 */
exports.approveAdminClinic = async (req, res) => {
    try {
        const { accountId } = req.params;
        const adminSystemId = req.user.admin_system_id; // Optional - có thể null

        // admin_system_id là optional, không cần check

        const result = await accountManagementService.approveAdminClinic({
            accountId,
            adminSystemId
        });

        return res.json({
            ok: true,
            message: 'Admin clinic approved successfully',
            data: result
        });
    } catch (error) {
        console.error('Error approving admin clinic:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to approve admin clinic'
        });
    }
};

/**
 * Từ chối ADMIN_CLINIC (PENDING -> REJECTED)
 */
exports.rejectAdminClinic = async (req, res) => {
    try {
        const { accountId } = req.params;
        const { rejectionReason } = req.body;
        const adminSystemId = req.user.admin_system_id; // Optional - có thể null

        // admin_system_id là optional, không cần check

        const result = await accountManagementService.rejectAdminClinic({
            accountId,
            adminSystemId,
            rejectionReason: rejectionReason || 'Không được chấp thuận'
        });

        return res.json({
            ok: true,
            message: 'Admin clinic rejected successfully',
            data: result
        });
    } catch (error) {
        console.error('Error rejecting admin clinic:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to reject admin clinic'
        });
    }
};

/**
 * Ban ADMIN_CLINIC (chuyển status -> SUSPENDED)
 */
exports.banAdminClinic = async (req, res) => {
    try {
        const { accountId } = req.params;
        const adminSystemId = req.user.admin_system_id; // Optional - có thể null

        // admin_system_id là optional, không cần check

        const result = await accountManagementService.banAdminClinic({
            accountId,
            adminSystemId
        });

        return res.json({
            ok: true,
            message: 'Admin clinic banned successfully',
            data: result
        });
    } catch (error) {
        console.error('Error banning admin clinic:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to ban admin clinic'
        });
    }
};

/**
 * Unban ADMIN_CLINIC (SUSPENDED -> ACTIVE)
 */
exports.unbanAdminClinic = async (req, res) => {
    try {
        const { accountId } = req.params;
        const adminSystemId = req.user.admin_system_id; // Optional - có thể null

        // admin_system_id là optional, không cần check

        const result = await accountManagementService.unbanAdminClinic({
            accountId,
            adminSystemId
        });

        return res.json({
            ok: true,
            message: 'Admin clinic unbanned successfully',
            data: result
        });
    } catch (error) {
        console.error('Error unbanning admin clinic:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to unban admin clinic'
        });
    }
};

/**
 * Lấy chi tiết ADMIN_CLINIC account
 */
exports.getAdminClinicDetail = async (req, res) => {
    try {
        const { accountId } = req.params;

        const result = await accountManagementService.getAdminClinicDetail({
            accountId
        });

        return res.json({
            ok: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting admin clinic detail:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to get admin clinic detail'
        });
    }
};

