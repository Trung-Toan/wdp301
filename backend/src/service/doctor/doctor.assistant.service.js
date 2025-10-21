const Assistant = require("../../model/user/Assistant");
const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");

const validation = require("../../utils/check_format_email_phone");

const doctorService = require("../doctor/doctor.service");

exports.getAccountIdByAssistantId = async (assistantId) => {
  try {
    const assistant = await Assistant.findById(assistantId).populate({
      path: 'user_id',
      select: 'account_id',
    });
    if (!assistant || !assistant.user_id) {
      throw new Error("Không tìm thấy trợ lý hoặc người dùng liên quan.");
    }
    return assistant.user_id.account_id;
  } catch (error) {
    console.error("Lỗi khi lấy account_id từ assistantId:", error);
    throw new Error("Lỗi khi lấy account_id từ assistantId.");
  }
};

exports.getListAssistants = async (req) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * limitNum;

  try {
    const doctor = await doctorService.findDoctorByAccountId(req.user.sub);
    if (!doctor) throw new Error('Truy cập bị từ chối: Không tìm thấy bác sĩ.');

    const doctorId = doctor._id;
    const searchRegex = search ? new RegExp(search, "i") : null;

    // --- Aggregation Pipeline ---
    const pipeline = [
      // 1. Lọc Trợ lý theo doctor_id
      { $match: { doctor_id: doctorId } },

      // 2. Lookup (Join) với Collection 'User'
      {
        $lookup: {
          from: 'users', // Tên collection thực tế của User
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            // Chỉ giữ lại các trường cần thiết trong User
            { $project: { __v: 0, createdAt: 0, updatedAt: 0, _id: 0 } },
            // Lookup (Join) với Collection 'Account' bên trong User lookup
            {
              $lookup: {
                from: 'accounts', // Tên collection thực tế của Account
                localField: 'account_id',
                foreignField: '_id',
                as: 'account',
                pipeline: [
                  // Chỉ giữ lại các trường cần thiết trong Account và loại bỏ password
                  { $project: { __v: 0, createdAt: 0, updatedAt: 0, _id: 0, password: 0 } }
                ]
              }
            },
            { $unwind: { path: '$account', preserveNullAndEmptyArrays: true } } // Chắc chắn account là object, không phải mảng
          ]
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }, // Chắc chắn user là object, không phải mảng

      // 3. Match (Tìm kiếm) sau khi đã join
      ...(search ? [{
        $match: {
          $or: [
            { 'user.full_name': searchRegex },
            { 'user.account.phone_number': searchRegex },
            { 'user.account.email': searchRegex }
          ]
        }
      }] : []),

      // 4. Sắp xếp kết quả
      { $sort: { createdAt: -1 } },

      // 5. Tính tổng số lượng (trước khi phân trang)
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limitNum }]
        }
      }
    ];
    // --- End Aggregation Pipeline ---

    const aggregationResult = await Assistant.aggregate(pipeline);
    const [{ metadata, data }] = aggregationResult;

    const totalAssistants = metadata.length > 0 ? metadata[0].total : 0;

    // Chuyển đổi định dạng kết quả để giống với cấu trúc ban đầu của bạn
    const assistantsWithAccount = data.map(assistant => ({
      assistant: {
        ...assistant,
        user: {
          ...assistant.user,
          account: assistant.user.account
        }
      }
    }));


    return {
      assistants: assistantsWithAccount,
      pagination: {
        total: totalAssistants,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalAssistants / limitNum),
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách trợ lý:", error);
    throw new Error("Lỗi khi lấy danh sách trợ lý.");
  }
};

exports.createAccountForAssistant = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { username, email, phone_number, password } = req.body;
    const role = "ASSISTANT";
    const email_verified = true;

    if (!username || !email || !phone_number || !password) {
      throw new Error(
        "Vui lòng cung cấp đầy đủ thông tin: username, email, phone_number và password."
      );
    }

    if (!validation.isValidEmail(email)) {
      throw new Error("Địa chỉ email không hợp lệ.");
    }

    if (!validation.isValidVietnamPhoneNumber(phone_number)) {
      throw new Error("Số điện thoại không hợp lệ.");
    }

    const existingAccount = await Account.findOne({ username }).session(session);
    if (existingAccount) {
      throw new Error("Tên đăng nhập đã tồn tại.");
    }

    const doctor = await doctorService.findDoctorByAccountId(req.user.sub);
    if (!doctor) throw new Error("Truy cập bị từ chối: Không tìm thấy bác sĩ.");

    const doctorId = doctor._id;

    // ✅ Tạo Account
    const newAccount = new Account({
      username,
      email,
      phone_number,
      password,
      role,
      email_verified,
    });
    const savedAccount = await newAccount.save({ session });

    // ✅ Tạo User
    const user = new User({ account_id: savedAccount._id });
    const savedUser = await user.save({ session });

    // ✅ Tạo Assistant
    const assistant = new Assistant({
      doctor_id: doctorId,
      user_id: savedUser._id,
    });
    const savedAssistant = await assistant.save({ session });

    // ✅ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return { assistant: savedAssistant };
  } catch (error) {
    // ✅ Rollback toàn bộ nếu lỗi
    await session.abortTransaction();
    session.endSession();
    console.error("Lỗi khi tạo tài khoản trợ lý:", error);
    throw error;
  }
};

exports.banAccountAssistant = async (req) => {
  const { assistantId } = req.params;
  const { status } = req.query;

  if (!assistantId) {
    throw new Error("Thiếu assistantId trong yêu cầu.");
  }

  if (!["INACTIVE", "ACTIVE"].includes(status)) {
    throw new Error("Trạng thái không hợp lệ. Chỉ chấp nhận 'INACTIVE' hoặc 'ACTIVE'.");
  }

  try {
    const accountId = await exports.getAccountIdByAssistantId(assistantId);
    if (!accountId) {
      throw new Error("Không tìm thấy tài khoản của trợ lý.");
    }

    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      { status },
      { new: true }
    );

    if (!updatedAccount) {
      throw new Error("Không thể cập nhật trạng thái tài khoản.");
    }

    return { message: `Cập nhật trạng thái trợ lý thành công: ${status}.` };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái trợ lý:", error);
    // ✅ Ném lại lỗi gốc để controller xử lý chi tiết hơn
    throw error;
  }
};
