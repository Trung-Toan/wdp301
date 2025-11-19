const Assistant = require("../../model/user/Assistant");
const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");

const validation = require("../../utils/check_format_email_phone");

const doctorService = require("../doctor/doctor.service");

exports.getAccountIdByAssistantId = async (assistantId) => {
  try {
    const assistant = await Assistant.findById(assistantId).populate({
      path: "user_id",
      select: "account_id",
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
    // 1. Lấy bác sĩ từ access token
    const doctor = await doctorService.findDoctorByAccountId(req.user.sub);
    if (!doctor) throw new Error("Truy cập bị từ chối: Không tìm thấy bác sĩ.");

    const doctorId = doctor._id;
    const searchRegex = search ? new RegExp(search, "i") : null;

    // 2. Lấy assistants bằng find + populate
    let assistants = await Assistant.find({ doctor_id: doctorId })
      .sort({ createdAt: -1 }) // giống $sort: { createdAt: -1 }
      .populate({
        path: "user_id",
        select: "-__v -createdAt -updatedAt", 
        populate: {
          path: "account_id",
          select: "-__v -createdAt -updatedAt", 
        },
      })
      .lean(); 

    // 3. Lọc theo search (full_name, phone_number, email) sau khi populate
    if (searchRegex) {
      assistants = assistants.filter((assistant) => {
        const user = assistant.user_id;
        const account = user?.account_id;

        return (
          (user?.full_name && searchRegex.test(user.full_name)) ||
          (account?.phone_number && searchRegex.test(account.phone_number)) ||
          (account?.email && searchRegex.test(account.email))
        );
      });
    }

    // 4. Tính total trước khi phân trang (giống $facet.metadata)
    const totalAssistants = assistants.length;

    // 5. Phân trang (giống $skip + $limit)
    const assistantsPage = assistants.slice(skip, skip + limitNum);

    // 6. Định dạng kết quả trả về cho giống code cũ
    const assistantsWithAccount = assistantsPage.map((assistant) => {

      const {user_id, ...assistantRest} = assistant;
      const {account_id, ...userRest} = user_id;

      const data = {
        assistant: assistantRest,
        user: userRest,
        account: account_id,
      }
      return data;
    });

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

    const existingAccount = await Account.findOne({ username }).session(
      session
    );
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
    throw new Error(
      "Trạng thái không hợp lệ. Chỉ chấp nhận 'INACTIVE' hoặc 'ACTIVE'."
    );
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
