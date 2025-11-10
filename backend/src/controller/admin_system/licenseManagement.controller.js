const licenseManagementService = require("../../service/admin_system/licenseManagement.service");

/**
 * GET /admin-system/licenses
 * Lấy danh sách tất cả licenses với filter và pagination
 */
exports.getAllLicenses = async (req, res) => {
    try {
        console.log("📥 GET /admin-system/licenses - Request received");
        const { status, search, page = 1, limit = 10 } = req.query;

        const result = await licenseManagementService.getAllLicenses({
            status,
            search,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        console.log("✅ GET /admin-system/licenses - Success");
        return res.json({
            ok: true,
            data: result
        });
    } catch (error) {
        console.error("❌ Error getting licenses:", error);
        return res.status(400).json({
            ok: false,
            message: error.message || "Failed to get licenses"
        });
    }
};

/**
 * GET /admin-system/licenses/:licenseId
 * Lấy chi tiết license theo ID
 */
exports.getLicenseById = async (req, res) => {
    try {
        console.log(`📥 GET /admin-system/licenses/${req.params.licenseId} - Request received`);
        const { licenseId } = req.params;

        const license = await licenseManagementService.getLicenseById(licenseId);

        console.log("✅ GET /admin-system/licenses/:licenseId - Success");
        return res.json({
            ok: true,
            data: license
        });
    } catch (error) {
        console.error("❌ Error getting license by id:", error);
        return res.status(400).json({
            ok: false,
            message: error.message || "Failed to get license"
        });
    }
};

/**
 * PUT /admin-system/licenses/:licenseId/status
 * Cập nhật trạng thái license (Approve/Reject)
 */
exports.updateLicenseStatus = async (req, res) => {
    try {
        console.log(`📥 PUT /admin-system/licenses/${req.params.licenseId}/status - Request received`);
        const { licenseId } = req.params;
        const { status, rejectionReason } = req.body;
        const adminSystemId = req.user?.admin_system_id || null;

        if (!status || !["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                ok: false,
                message: "Trạng thái không hợp lệ. Chỉ chấp nhận APPROVED hoặc REJECTED"
            });
        }

        const license = await licenseManagementService.updateLicenseStatus({
            licenseId,
            status,
            adminSystemId,
            rejectionReason
        });

        console.log("✅ PUT /admin-system/licenses/:licenseId/status - Success");
        return res.json({
            ok: true,
            data: license,
            message: status === "APPROVED" ? "Phê duyệt chứng chỉ thành công" : "Từ chối chứng chỉ thành công"
        });
    } catch (error) {
        console.error("❌ Error updating license status:", error);
        return res.status(400).json({
            ok: false,
            message: error.message || "Failed to update license status"
        });
    }
};

