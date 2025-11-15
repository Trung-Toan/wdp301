const relativeService = require("../../service/patient/relative.service");
const resUtils = require("../../utils/responseUtils");

/**
 * Lấy danh sách người thân của user hiện tại
 * GET /api/patient/relatives
 */
exports.getRelatives = async (req, res) => {
  try {
    const userId = req.user.sub; // Từ JWT token
    const { page = 1, limit = 50 } = req.query;

    const result = await relativeService.getRelativesByUserId(userId, {
      page: Number(page),
      limit: Number(limit)
    });

    return resUtils.paginatedResponse(
      res,
      result.items,
      {
        totalItems: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      },
      "Lấy danh sách người thân thành công"
    );
  } catch (error) {
    console.error("Error in getRelatives:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Lỗi khi lấy danh sách người thân"
    });
  }
};

/**
 * Lấy chi tiết một người thân
 * GET /api/patient/relatives/:id
 */
exports.getRelativeById = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const relative = await relativeService.getRelativeById(id, userId);

    return resUtils.successResponse(
      res,
      relative,
      "Lấy thông tin người thân thành công"
    );
  } catch (error) {
    console.error("Error in getRelativeById:", error);
    
    if (error.message === "Relative not found" || error.message.includes("Invalid")) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Lỗi khi lấy thông tin người thân"
    });
  }
};

/**
 * Tạo người thân mới
 * POST /api/patient/relatives
 */
exports.createRelative = async (req, res) => {
  try {
    const userId = req.user.sub;
    const data = {
      ...req.body,
      user_id: userId
    };

    const relative = await relativeService.createRelative(data);

    return resUtils.successResponse(
      res,
      relative,
      "Tạo người thân thành công",
      201
    );
  } catch (error) {
    console.error("Error in createRelative:", error);
    
    if (error.message.includes("Missing required fields") || 
        error.message.includes("Invalid") ||
        error.message.includes("đã tồn tại")) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Lỗi khi tạo người thân"
    });
  }
};

/**
 * Cập nhật thông tin người thân
 * PUT /api/patient/relatives/:id
 */
exports.updateRelative = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const relative = await relativeService.updateRelative(id, userId, req.body);

    return resUtils.successResponse(
      res,
      relative,
      "Cập nhật thông tin người thân thành công"
    );
  } catch (error) {
    console.error("Error in updateRelative:", error);
    
    if (error.message === "Relative not found" || error.message.includes("Invalid")) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Lỗi khi cập nhật thông tin người thân"
    });
  }
};

/**
 * Xóa người thân
 * DELETE /api/patient/relatives/:id
 */
exports.deleteRelative = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    await relativeService.deleteRelative(id, userId);

    return resUtils.successResponse(
      res,
      null,
      "Xóa người thân thành công"
    );
  } catch (error) {
    console.error("Error in deleteRelative:", error);
    
    if (error.message === "Relative not found" || error.message.includes("Invalid")) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Lỗi khi xóa người thân"
    });
  }
};

