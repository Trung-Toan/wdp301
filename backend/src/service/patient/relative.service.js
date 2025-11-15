const Relative = require("../../model/patient/Relative");
const mongoose = require("mongoose");
const { Types } = mongoose;

/**
 * Lấy danh sách người thân của user
 * @param {string} userId - ID của user
 * @param {Object} options - Options: page, limit
 * @returns {Promise<Object>} Danh sách người thân với pagination
 */
exports.getRelativesByUserId = async (userId, options = {}) => {
  const { page = 1, limit = 50 } = options;
  
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const skip = (page - 1) * limit;

  const [relatives, total] = await Promise.all([
    Relative.find({ user_id: userId, is_active: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Relative.countDocuments({ user_id: userId, is_active: true })
  ]);

  return {
    items: relatives,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Lấy chi tiết một người thân
 * @param {string} relativeId - ID của người thân
 * @param {string} userId - ID của user (để verify quyền)
 * @returns {Promise<Object>} Thông tin người thân
 */
exports.getRelativeById = async (relativeId, userId) => {
  if (!Types.ObjectId.isValid(relativeId)) {
    throw new Error("Invalid relativeId");
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const relative = await Relative.findOne({
    _id: relativeId,
    user_id: userId,
    is_active: true
  }).lean();

  if (!relative) {
    throw new Error("Relative not found");
  }

  return relative;
};

/**
 * Tạo người thân mới
 * @param {Object} data - Thông tin người thân
 * @param {string} data.user_id - ID của user tạo
 * @returns {Promise<Object>} Người thân đã tạo
 */
exports.createRelative = async (data) => {
  const {
    user_id,
    full_name,
    phone,
    email,
    dob,
    gender,
    province_code,
    ward_code,
    address,
    relationship,
    notes
  } = data;

  // Validate required fields
  if (!user_id || !full_name || !phone || !relationship) {
    throw new Error("Missing required fields: user_id, full_name, phone, relationship");
  }

  if (!Types.ObjectId.isValid(user_id)) {
    throw new Error("Invalid user_id");
  }

  // Kiểm tra trùng phone trong cùng user (optional - có thể bỏ nếu muốn)
  const existing = await Relative.findOne({
    user_id,
    phone,
    is_active: true
  });

  if (existing) {
    throw new Error("Người thân với số điện thoại này đã tồn tại");
  }

  const relative = new Relative({
    user_id,
    full_name,
    phone,
    email: email || null,
    dob: dob ? new Date(dob) : null,
    gender: gender || "MALE",
    province_code: province_code || null,
    ward_code: ward_code || null,
    address: address || null,
    relationship,
    notes: notes || null,
    is_active: true
  });

  await relative.save();
  return relative.toObject();
};

/**
 * Cập nhật thông tin người thân
 * @param {string} relativeId - ID của người thân
 * @param {string} userId - ID của user (để verify quyền)
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Người thân đã cập nhật
 */
exports.updateRelative = async (relativeId, userId, updateData) => {
  if (!Types.ObjectId.isValid(relativeId)) {
    throw new Error("Invalid relativeId");
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const relative = await Relative.findOne({
    _id: relativeId,
    user_id: userId
  });

  if (!relative) {
    throw new Error("Relative not found");
  }

  // Cập nhật các field được phép
  const allowedFields = [
    "full_name", "phone", "email", "dob", "gender",
    "province_code", "ward_code", "address", "relationship", "notes"
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      if (field === "dob" && updateData[field]) {
        relative[field] = new Date(updateData[field]);
      } else {
        relative[field] = updateData[field];
      }
    }
  });

  await relative.save();
  return relative.toObject();
};

/**
 * Xóa (soft delete) người thân
 * @param {string} relativeId - ID của người thân
 * @param {string} userId - ID của user (để verify quyền)
 * @returns {Promise<Object>} Kết quả xóa
 */
exports.deleteRelative = async (relativeId, userId) => {
  if (!Types.ObjectId.isValid(relativeId)) {
    throw new Error("Invalid relativeId");
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const relative = await Relative.findOne({
    _id: relativeId,
    user_id: userId
  });

  if (!relative) {
    throw new Error("Relative not found");
  }

  // Soft delete
  relative.is_active = false;
  await relative.save();

  return { success: true, message: "Relative deleted successfully" };
};

