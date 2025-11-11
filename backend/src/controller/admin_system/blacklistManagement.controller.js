const blacklistService = require("../../service/admin_system/blacklistManagement.service");

/**
 * GET /admin-system/blacklists
 */
exports.getAllBlacklists = async (req, res) => {
  try {
    console.log("📥 GET /admin-system/blacklists - Request received");
    const { search, role, page = 1, limit = 10 } = req.query;

    const result = await blacklistService.getAllBlacklists({
      search,
      role,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    console.log("✅ GET /admin-system/blacklists - Success");
    return res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error getting blacklists:", error);
    return res.status(400).json({
      ok: false,
      message: error.message || "Failed to get blacklists",
    });
  }
};

/**
 * POST /admin-system/blacklists
 */
exports.addToBlacklist = async (req, res) => {
  try {
    console.log("📥 POST /admin-system/blacklists - Request received");
    const { accountId, accountIdentifier, reason, evidence } = req.body;

    if (!accountId && !accountIdentifier) {
      return res.status(400).json({
        ok: false,
        message: "Vui lòng cung cấp accountId hoặc accountIdentifier",
      });
    }

    const record = await blacklistService.addToBlacklist({
      accountId,
      accountIdentifier,
      reason,
      evidence,
    });

    console.log("✅ POST /admin-system/blacklists - Success");
    return res.status(201).json({
      ok: true,
      data: record,
      message: "Thêm vào danh sách đen thành công",
    });
  } catch (error) {
    console.error("❌ Error adding to blacklist:", error);
    return res.status(400).json({
      ok: false,
      message: error.message || "Failed to add to blacklist",
    });
  }
};

/**
 * DELETE /admin-system/blacklists/:blacklistId
 */
exports.removeFromBlacklist = async (req, res) => {
  try {
    console.log(
      `📥 DELETE /admin-system/blacklists/${req.params.blacklistId} - Request received`
    );
    const { blacklistId } = req.params;

    await blacklistService.removeFromBlacklist({ blacklistId });

    console.log("✅ DELETE /admin-system/blacklists/:blacklistId - Success");
    return res.json({
      ok: true,
      message: "Xóa khỏi danh sách đen thành công",
    });
  } catch (error) {
    console.error("❌ Error removing from blacklist:", error);
    return res.status(400).json({
      ok: false,
      message: error.message || "Failed to remove from blacklist",
    });
  }
};
