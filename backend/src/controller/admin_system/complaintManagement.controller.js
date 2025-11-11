const complaintManagementService = require('../../service/admin_system/complaintManagement.service');

/**
 * Lấy danh sách tất cả khiếu nại (cho admin system)
 */
exports.getAllComplaints = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, complaint_type, search } = req.query;

        const result = await complaintManagementService.getAllComplaints({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            complaint_type,
            search
        });

        return res.json({
            ok: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting all complaints:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to get complaints'
        });
    }
};

/**
 * Lấy chi tiết khiếu nại
 */
exports.getComplaintById = async (req, res) => {
    try {
        const { complaintId } = req.params;

        const result = await complaintManagementService.getComplaintById(complaintId);

        return res.json({
            ok: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting complaint by id:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to get complaint'
        });
    }
};

/**
 * Cập nhật trạng thái khiếu nại
 */
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { status, resolutionNote, dismissedReason } = req.body;
        const adminSystemId = req.user?.admin_system_id || null;

        if (!status) {
            return res.status(400).json({
                ok: false,
                message: 'Status is required'
            });
        }

        const result = await complaintManagementService.updateComplaintStatus({
            complaintId,
            status,
            adminSystemId,
            resolutionNote,
            dismissedReason
        });

        return res.json({
            ok: true,
            message: 'Complaint status updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to update complaint status'
        });
    }
};

/**
 * Lấy thống kê khiếu nại
 */
exports.getComplaintStats = async (req, res) => {
    try {
        const result = await complaintManagementService.getComplaintStats();

        return res.json({
            ok: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting complaint stats:', error);
        return res.status(400).json({
            ok: false,
            message: error.message || 'Failed to get complaint stats'
        });
    }
};

