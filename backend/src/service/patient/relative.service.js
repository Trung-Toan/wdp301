const Relative = require("../../model/patient/Relative");
const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");
const Patient = require("../../model/patient/Patient");
const mongoose = require("mongoose");
const { Types } = mongoose;

/**
 * Lấy danh sách người thân của user
 * @param {string} userId - ID của user (có thể là Account ID hoặc User ID)
 * @param {Object} options - Options: page, limit
 * @returns {Promise<Object>} Danh sách người thân với pagination
 */
exports.getRelativesByUserId = async (userId, options = {}) => {
  const { page = 1, limit = 50 } = options;
  
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  // user_id có thể là Account ID hoặc User ID, cần tìm User ID thực tế
  let actualUserId = userId;
  
  // Thử tìm User trực tiếp bằng userId
  let user = await User.findById(userId);
  
  // Nếu không tìm thấy, có thể userId là Account ID
  if (!user) {
    const account = await Account.findById(userId);
    if (account) {
      user = await User.findOne({ account_id: account._id });
      if (user) {
        actualUserId = user._id;
      }
    }
  } else {
    actualUserId = user._id;
  }

  if (!user) {
    throw new Error("User not found for the provided userId");
  }

  const skip = (page - 1) * limit;

  const [relatives, total] = await Promise.all([
    Relative.find({ user_id: actualUserId, is_active: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Relative.countDocuments({ user_id: actualUserId, is_active: true })
  ]);

  // Enrich relatives với thông tin từ User/Patient nếu thiếu
  const enrichedRelatives = await Promise.all(relatives.map(async (relative) => {
    // Nếu relative có patient_id, lấy thông tin từ Patient
    if (relative.patient_id) {
      const patient = await Patient.findById(relative.patient_id).lean();
      if (patient) {
        // Lấy User từ Patient
        if (patient.user_id) {
          const user = await User.findById(patient.user_id).lean();
          const account = user ? await Account.findById(user.account_id).lean() : null;
          
          // Bổ sung thông tin thiếu từ User/Patient
          return {
            ...relative,
            dob: relative.dob || user?.dob || patient.dob || null,
            gender: relative.gender || user?.gender || patient.gender || relative.gender || "MALE",
            province_code: relative.province_code || patient.province_code || null,
            ward_code: relative.ward_code || patient.ward_code || null,
            address: relative.address || user?.address || patient.address || null,
            email: relative.email || account?.email || patient.email || null,
            phone: relative.phone || account?.phone_number || patient.phone || relative.phone,
          };
        }
      }
    }
    
    // Nếu không có patient_id, tìm User/Patient qua phone/email
    if ((!relative.dob || !relative.gender || !relative.province_code) && (relative.phone || relative.email)) {
      const account = await Account.findOne({
        $or: [
          { phone_number: relative.phone },
          { email: relative.email }
        ]
      }).lean();
      
      if (account) {
        const user = await User.findOne({ account_id: account._id }).lean();
        if (user) {
          const patient = await Patient.findOne({ user_id: user._id }).lean();
          
          return {
            ...relative,
            dob: relative.dob || user.dob || patient?.dob || null,
            gender: relative.gender || user.gender || patient?.gender || relative.gender || "MALE",
            province_code: relative.province_code || patient?.province_code || null,
            ward_code: relative.ward_code || patient?.ward_code || null,
            address: relative.address || user.address || patient?.address || null,
          };
        }
      }
    }
    
    return relative;
  }));

  return {
    items: enrichedRelatives,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Lấy chi tiết một người thân
 * @param {string} relativeId - ID của người thân
 * @param {string} userId - ID của user (có thể là Account ID hoặc User ID)
 * @returns {Promise<Object>} Thông tin người thân
 */
exports.getRelativeById = async (relativeId, userId) => {
  if (!Types.ObjectId.isValid(relativeId)) {
    throw new Error("Invalid relativeId");
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  // user_id có thể là Account ID hoặc User ID, cần tìm User ID thực tế
  let actualUserId = userId;
  
  // Thử tìm User trực tiếp bằng userId
  let user = await User.findById(userId);
  
  // Nếu không tìm thấy, có thể userId là Account ID
  if (!user) {
    const account = await Account.findById(userId);
    if (account) {
      user = await User.findOne({ account_id: account._id });
      if (user) {
        actualUserId = user._id;
      }
    }
  } else {
    actualUserId = user._id;
  }

  if (!user) {
    throw new Error("User not found for the provided userId");
  }

  let relative = await Relative.findOne({
    _id: relativeId,
    user_id: actualUserId,
    is_active: true
  }).lean();

  if (!relative) {
    throw new Error("Relative not found");
  }

  // Enrich relative với thông tin từ User/Patient nếu thiếu
  // Nếu relative có patient_id, lấy thông tin từ Patient
  if (relative.patient_id) {
    const patient = await Patient.findById(relative.patient_id).lean();
    if (patient && patient.user_id) {
      const user = await User.findById(patient.user_id).lean();
      const account = user ? await Account.findById(user.account_id).lean() : null;
      
      // Bổ sung thông tin thiếu từ User/Patient
      relative = {
        ...relative,
        dob: relative.dob || user?.dob || patient.dob || null,
        gender: relative.gender || user?.gender || patient.gender || relative.gender || "MALE",
        province_code: relative.province_code || patient.province_code || null,
        ward_code: relative.ward_code || patient.ward_code || null,
        address: relative.address || user?.address || patient.address || null,
        email: relative.email || account?.email || patient.email || null,
        phone: relative.phone || account?.phone_number || patient.phone || relative.phone,
      };
    }
  } else if ((!relative.dob || !relative.gender || !relative.province_code) && (relative.phone || relative.email)) {
    // Nếu không có patient_id, tìm User/Patient qua phone/email
    const account = await Account.findOne({
      $or: [
        { phone_number: relative.phone },
        { email: relative.email }
      ]
    }).lean();
    
    if (account) {
      const user = await User.findOne({ account_id: account._id }).lean();
      if (user) {
        const patient = await Patient.findOne({ user_id: user._id }).lean();
        
        relative = {
          ...relative,
          dob: relative.dob || user.dob || patient?.dob || null,
          gender: relative.gender || user.gender || patient?.gender || relative.gender || "MALE",
          province_code: relative.province_code || patient?.province_code || null,
          ward_code: relative.ward_code || patient?.ward_code || null,
          address: relative.address || user.address || patient?.address || null,
        };
      }
    }
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
    user_id, // Lưu ý: user_id có thể là Account ID hoặc User ID
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

  // user_id từ JWT token là Account ID, cần tìm User ID
  let actualUserId = user_id;
  let currentAccount = null;
  
  // Thử tìm User trực tiếp bằng user_id
  let currentUser = await User.findById(user_id);
  
  // Nếu không tìm thấy, có thể user_id là Account ID
  if (!currentUser) {
    currentAccount = await Account.findById(user_id);
    if (currentAccount) {
      currentUser = await User.findOne({ account_id: currentAccount._id });
      if (currentUser) {
        actualUserId = currentUser._id;
        console.log(`✅ Found User from Account ID: ${user_id} -> User ID: ${actualUserId}`);
      }
    }
  } else {
    // Nếu tìm thấy User, lấy Account
    currentAccount = await Account.findById(currentUser.account_id);
  }

  if (!currentUser) {
    throw new Error("User not found for the provided user_id");
  }

  // Kiểm tra trùng phone trong cùng user (optional - có thể bỏ nếu muốn)
  const existing = await Relative.findOne({
    user_id: actualUserId,
    phone,
    is_active: true
  });

  if (existing) {
    throw new Error("Người thân với số điện thoại này đã tồn tại");
  }

  const relative = new Relative({
    user_id: actualUserId,
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

  // Tạo quan hệ 2 chiều: Tìm User của người thân (qua phone/email) và tạo relative ngược lại
  try {
    console.log(`🔍 Creating bidirectional relationship for relative: ${full_name} (${phone}${email ? `, ${email}` : ''})`);
    
    // Tìm Account của người thân qua phone hoặc email
    const searchConditions = [];
    if (phone) {
      searchConditions.push({ phone_number: phone });
    }
    if (email) {
      searchConditions.push({ email: email });
    }

    if (searchConditions.length === 0) {
      console.log("⚠️ No phone or email provided for relative, skipping bidirectional relationship");
    } else {
      const relativeAccount = await Account.findOne({
        $or: searchConditions,
        role: "PATIENT" // Chỉ tìm account của patient
      });

      if (!relativeAccount) {
        console.log(`⚠️ Account not found for relative (phone: ${phone}, email: ${email}), skipping bidirectional relationship`);
      } else {
        console.log(`✅ Found relative account: ${relativeAccount._id} (${relativeAccount.email || relativeAccount.phone_number})`);

        // Tìm User từ Account
        const relativeUser = await User.findOne({ account_id: relativeAccount._id });

        if (!relativeUser) {
          console.log(`⚠️ User not found for account ${relativeAccount._id}, skipping bidirectional relationship`);
        } else {
          console.log(`✅ Found relative user: ${relativeUser._id}`);

          // Mapping relationship ngược lại
          let reverseRelationship;
          switch (relationship) {
            case "cha":
            case "me":
              reverseRelationship = "con";
              break;
            case "con":
              // Không biết chính xác là "cha" hay "me", dựa vào gender
              // Nếu gender là MALE -> "cha", FEMALE -> "me"
              reverseRelationship = (gender === "FEMALE") ? "me" : "cha";
              break;
            case "vo_chong":
              reverseRelationship = "vo_chong";
              break;
            case "anh_chi_em":
              reverseRelationship = "anh_chi_em";
              break;
            case "ban":
              reverseRelationship = "ban";
              break;
            case "khac":
              reverseRelationship = "khac";
              break;
            default:
              reverseRelationship = "khac";
          }

          console.log(`📋 Relationship mapping: ${relationship} -> ${reverseRelationship}`);

          // Lấy thông tin của user hiện tại (người tạo relative) - đã có từ trên
          if (!currentUser || !currentAccount) {
            console.log(`⚠️ Current user or account not found, skipping bidirectional relationship`);
          } else {
            console.log(`✅ Using current user: ${currentUser._id} (${currentAccount.email || currentAccount.phone_number})`);

            // Kiểm tra xem relative ngược lại đã tồn tại chưa (tìm bằng phone hoặc email)
            const existingReverseRelativeConditions = [];
            if (currentAccount.phone_number) {
              existingReverseRelativeConditions.push({ phone: currentAccount.phone_number });
            }
            if (currentAccount.email) {
              existingReverseRelativeConditions.push({ email: currentAccount.email });
            }

            let existingReverseRelative = null;
            if (existingReverseRelativeConditions.length > 0) {
              existingReverseRelative = await Relative.findOne({
                user_id: relativeUser._id,
                is_active: true,
                $or: existingReverseRelativeConditions
              });
            }

            if (existingReverseRelative) {
              console.log(`⚠️ Reverse relative already exists: ${existingReverseRelative._id}, skipping creation`);
              // Có thể cập nhật relationship nếu cần
              if (existingReverseRelative.relationship !== reverseRelationship) {
                existingReverseRelative.relationship = reverseRelationship;
                await existingReverseRelative.save();
                console.log(`✅ Updated reverse relative relationship to: ${reverseRelationship}`);
              }
            } else {
              // Tạo relative ngược lại
              if (!currentAccount.phone_number && !currentAccount.email) {
                console.log(`⚠️ Current account has no phone or email, cannot create reverse relative`);
              } else {
                // Lấy thông tin đầy đủ từ Patient của currentUser (nếu có)
                let patientInfo = null;
                if (currentUser) {
                  patientInfo = await Patient.findOne({ user_id: currentUser._id }).lean();
                }

                const reverseRelative = new Relative({
                  user_id: relativeUser._id,
                  full_name: currentUser.full_name || currentAccount.email?.split("@")[0] || "Người thân",
                  phone: currentAccount.phone_number || "",
                  email: currentAccount.email || null,
                  dob: currentUser.dob || patientInfo?.dob || null,
                  gender: currentUser.gender || patientInfo?.gender || "MALE",
                  province_code: patientInfo?.province_code || currentUser.address?.province_code || null,
                  ward_code: patientInfo?.ward_code || currentUser.address?.ward_code || null,
                  address: currentUser.address || patientInfo?.address || null,
                  relationship: reverseRelationship,
                  is_active: true
                });

                await reverseRelative.save();
                console.log(`✅ Created bidirectional relationship: ${relativeUser._id} -> ${actualUserId} (${reverseRelationship})`);
                console.log(`   Reverse relative ID: ${reverseRelative._id}, Name: ${reverseRelative.full_name}, Phone: ${reverseRelative.phone}`);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    // Không throw error nếu không tạo được quan hệ 2 chiều (người thân chưa có account)
    console.error("❌ Error creating bidirectional relationship:", error.message);
    console.error("Stack:", error.stack);
  }

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

  // user_id có thể là Account ID hoặc User ID, cần tìm User ID thực tế
  let actualUserId = userId;
  
  // Thử tìm User trực tiếp bằng userId
  let user = await User.findById(userId);
  
  // Nếu không tìm thấy, có thể userId là Account ID
  if (!user) {
    const account = await Account.findById(userId);
    if (account) {
      user = await User.findOne({ account_id: account._id });
      if (user) {
        actualUserId = user._id;
      }
    }
  } else {
    actualUserId = user._id;
  }

  if (!user) {
    throw new Error("User not found for the provided userId");
  }

  const relative = await Relative.findOne({
    _id: relativeId,
    user_id: actualUserId
  });

  if (!relative) {
    throw new Error("Relative not found");
  }

  // Lưu thông tin cũ để tìm relative ngược lại
  const oldPhone = relative.phone;
  const oldEmail = relative.email;
  const oldRelationship = relative.relationship;
  const oldFullName = relative.full_name;
  const oldGender = relative.gender;

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

  // Cập nhật quan hệ 2 chiều: Tìm và cập nhật relative ngược lại
  try {
    // Tìm Account của người thân qua phone hoặc email (ưu tiên phone/email mới, nếu không có thì dùng cũ)
    const searchPhone = relative.phone || oldPhone;
    const searchEmail = relative.email || oldEmail;

    if (searchPhone || searchEmail) {
      const relativeAccount = await Account.findOne({
        $or: [
          { phone_number: searchPhone },
          { email: searchEmail }
        ],
        role: "PATIENT"
      });

      if (relativeAccount) {
        // Tìm User từ Account
        const relativeUser = await User.findOne({ account_id: relativeAccount._id });

        if (relativeUser) {
          // Lấy thông tin của user hiện tại (người update relative)
          const currentUser = await User.findById(userId);
          if (currentUser) {
            const currentAccount = await Account.findById(currentUser.account_id);
            if (currentAccount) {
              // Tìm relative ngược lại (từ phía người thân)
              // Ưu tiên tìm bằng phone/email mới, nếu không có thì tìm bằng phone/email cũ
              let reverseRelative = await Relative.findOne({
                user_id: relativeUser._id,
                is_active: true,
                $or: [
                  { phone: currentAccount.phone_number || "" },
                  { email: currentAccount.email || "" }
                ]
              });

              // Nếu không tìm thấy bằng phone/email mới, thử tìm bằng phone/email cũ (nếu có thay đổi)
              if (!reverseRelative && (oldPhone || oldEmail)) {
                reverseRelative = await Relative.findOne({
                  user_id: relativeUser._id,
                  is_active: true,
                  $or: [
                    { phone: oldPhone },
                    { email: oldEmail }
                  ]
                });
              }

              // Mapping relationship ngược lại
              let reverseRelationship;
              const newRelationship = relative.relationship || oldRelationship;
              switch (newRelationship) {
                case "cha":
                case "me":
                  reverseRelationship = "con";
                  break;
                case "con":
                  // Dựa vào gender mới hoặc cũ
                  const genderToUse = relative.gender || oldGender;
                  reverseRelationship = (genderToUse === "FEMALE") ? "me" : "cha";
                  break;
                case "vo_chong":
                  reverseRelationship = "vo_chong";
                  break;
                case "anh_chi_em":
                  reverseRelationship = "anh_chi_em";
                  break;
                case "ban":
                  reverseRelationship = "ban";
                  break;
                case "khac":
                  reverseRelationship = "khac";
                  break;
                default:
                  reverseRelationship = "khac";
              }

              if (reverseRelative) {
                // Cập nhật relative ngược lại
                if (updateData.full_name !== undefined) {
                  reverseRelative.full_name = currentUser.full_name || currentAccount.email?.split("@")[0] || "Người thân";
                }
                if (updateData.phone !== undefined && currentAccount.phone_number) {
                  reverseRelative.phone = currentAccount.phone_number;
                }
                if (updateData.email !== undefined && currentAccount.email) {
                  reverseRelative.email = currentAccount.email;
                }
                if (updateData.relationship !== undefined) {
                  reverseRelative.relationship = reverseRelationship;
                }
                if (updateData.province_code !== undefined) {
                  reverseRelative.province_code = updateData.province_code;
                }
                if (updateData.ward_code !== undefined) {
                  reverseRelative.ward_code = updateData.ward_code;
                }
                if (updateData.address !== undefined) {
                  reverseRelative.address = updateData.address;
                }

                await reverseRelative.save();
                console.log(`✅ Updated bidirectional relationship: ${relativeUser._id} -> ${userId} (${reverseRelationship})`);
              } else {
                // Nếu không tìm thấy relative ngược lại, tạo mới (nếu có đủ thông tin)
                if (currentAccount.phone_number || currentAccount.email) {
                  // Lấy thông tin đầy đủ từ Patient của currentUser (nếu có)
                  let patientInfo = null;
                  if (currentUser) {
                    patientInfo = await Patient.findOne({ user_id: currentUser._id }).lean();
                  }

                  const newReverseRelative = new Relative({
                    user_id: relativeUser._id,
                    full_name: currentUser.full_name || currentAccount.email?.split("@")[0] || "Người thân",
                    phone: currentAccount.phone_number || "",
                    email: currentAccount.email || null,
                    dob: currentUser.dob || patientInfo?.dob || null,
                    gender: currentUser.gender || patientInfo?.gender || "MALE",
                    province_code: patientInfo?.province_code || currentUser.address?.province_code || null,
                    ward_code: patientInfo?.ward_code || currentUser.address?.ward_code || null,
                    address: currentUser.address || patientInfo?.address || null,
                    relationship: reverseRelationship,
                    is_active: true
                  });

                  await newReverseRelative.save();
                  console.log(`✅ Created bidirectional relationship: ${relativeUser._id} -> ${actualUserId} (${reverseRelationship})`);
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    // Không throw error nếu không cập nhật được quan hệ 2 chiều
    console.log("⚠️ Could not update bidirectional relationship:", error.message);
  }

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

  // user_id có thể là Account ID hoặc User ID, cần tìm User ID thực tế
  let actualUserId = userId;
  
  // Thử tìm User trực tiếp bằng userId
  let user = await User.findById(userId);
  
  // Nếu không tìm thấy, có thể userId là Account ID
  if (!user) {
    const account = await Account.findById(userId);
    if (account) {
      user = await User.findOne({ account_id: account._id });
      if (user) {
        actualUserId = user._id;
      }
    }
  } else {
    actualUserId = user._id;
  }

  if (!user) {
    throw new Error("User not found for the provided userId");
  }

  const relative = await Relative.findOne({
    _id: relativeId,
    user_id: actualUserId
  });

  if (!relative) {
    throw new Error("Relative not found");
  }

  // Soft delete
  relative.is_active = false;
  await relative.save();

  return { success: true, message: "Relative deleted successfully" };
};

/**
 * Khôi phục người thân đã bị xóa (restore)
 * @param {string} relativeId - ID của người thân
 * @param {string} userId - ID của user (để verify quyền)
 * @returns {Promise<Object>} Người thân đã được khôi phục
 */
exports.restoreRelative = async (relativeId, userId) => {
  if (!Types.ObjectId.isValid(relativeId)) {
    throw new Error("Invalid relativeId");
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  // user_id có thể là Account ID hoặc User ID, cần tìm User ID thực tế
  let actualUserId = userId;
  
  // Thử tìm User trực tiếp bằng userId
  let user = await User.findById(userId);
  
  // Nếu không tìm thấy, có thể userId là Account ID
  if (!user) {
    const account = await Account.findById(userId);
    if (account) {
      user = await User.findOne({ account_id: account._id });
      if (user) {
        actualUserId = user._id;
      }
    }
  } else {
    actualUserId = user._id;
  }

  if (!user) {
    throw new Error("User not found for the provided userId");
  }

  // Tìm relative (bao gồm cả đã xóa)
  const relative = await Relative.findOne({
    _id: relativeId,
    user_id: actualUserId
  });

  if (!relative) {
    throw new Error("Relative not found");
  }

  // Kiểm tra đã active chưa
  if (relative.is_active) {
    throw new Error("Relative is already active");
  }

  // Kiểm tra trùng phone với relative active khác
  const existingActive = await Relative.findOne({
    user_id: actualUserId,
    phone: relative.phone,
    is_active: true,
    _id: { $ne: relativeId } // Loại trừ chính nó
  });

  if (existingActive) {
    throw new Error("Người thân với số điện thoại này đã tồn tại trong danh sách active");
  }

  // Khôi phục
  relative.is_active = true;
  await relative.save();

  return relative.toObject();
};

/**
 * Lấy danh sách người thân đã bị xóa (soft deleted)
 * @param {string} userId - ID của user
 * @param {Object} options - Options: page, limit
 * @returns {Promise<Object>} Danh sách người thân đã xóa với pagination
 */
exports.getDeletedRelatives = async (userId, options = {}) => {
  const { page = 1, limit = 50 } = options;
  
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  // user_id có thể là Account ID hoặc User ID, cần tìm User ID thực tế
  let actualUserId = userId;
  
  // Thử tìm User trực tiếp bằng userId
  let user = await User.findById(userId);
  
  // Nếu không tìm thấy, có thể userId là Account ID
  if (!user) {
    const account = await Account.findById(userId);
    if (account) {
      user = await User.findOne({ account_id: account._id });
      if (user) {
        actualUserId = user._id;
      }
    }
  } else {
    actualUserId = user._id;
  }

  if (!user) {
    throw new Error("User not found for the provided userId");
  }

  const skip = (page - 1) * limit;

  const [relatives, total] = await Promise.all([
    Relative.find({ user_id: actualUserId, is_active: false })
      .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian xóa gần nhất
      .skip(skip)
      .limit(limit)
      .lean(),
    Relative.countDocuments({ user_id: actualUserId, is_active: false })
  ]);

  return {
    items: relatives,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

