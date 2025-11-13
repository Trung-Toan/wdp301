const Blacklist = require("../../model/system/Blacklist");
const Account = require("../../model/auth/Account");
const User = require("../../model/user/User");

/**
 * Helper: format blacklist record for response
 */
const formatBlacklistRecord = (record, userMap = {}) => {
  if (!record) return null;

  const account = record.account_id || {};
  const userInfo = userMap[account._id?.toString()] || null;

  return {
    id: record._id.toString(),
    reason: record.reason || "",
    evidence: record.evidence || "",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    account: account
      ? {
          id: account._id?.toString(),
          username: account.username,
          email: account.email,
          phone_number: account.phone_number,
          role: account.role,
          status: account.status,
          full_name: userInfo?.full_name || null,
        }
      : null,
  };
};

/**
 * Lấy danh sách blacklist với filter & pagination
 */
exports.getAllBlacklists = async ({ search, role, page = 1, limit = 10 }) => {
  try {
    const query = {};

    // Chuẩn bị filter theo account
    const accountQuery = {};
    if (role && role !== "all") {
      accountQuery.role = role;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      accountQuery.$or = [
        { username: regex },
        { email: regex },
        { phone_number: regex },
      ];
    }

    if (Object.keys(accountQuery).length > 0) {
      const matchingAccounts = await Account.find(accountQuery)
        .select("_id")
        .lean();

      if (!matchingAccounts.length) {
        return {
          items: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      query.account_id = {
        $in: matchingAccounts.map((acc) => acc._id),
      };
    }

    const skip = (page - 1) * limit;

    const blacklists = await Blacklist.find(query)
      .populate({
        path: "account_id",
        select: "username email phone_number role status",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blacklist.countDocuments(query);

    // Lấy thông tin user (full_name)
    const accountIds = blacklists
      .map((item) => item.account_id?._id?.toString())
      .filter(Boolean);

    let userMap = {};
    if (accountIds.length > 0) {
      const users = await User.find({ account_id: { $in: accountIds } })
        .select("account_id full_name")
        .lean();

      userMap = users.reduce((acc, user) => {
        acc[user.account_id?.toString()] = user;
        return acc;
      }, {});
    }

    const formatted = blacklists.map((record) =>
      formatBlacklistRecord(record, userMap)
    );

    return {
      items: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error in getAllBlacklists:", error);
    throw error;
  }
};

/**
 * Thêm tài khoản vào blacklist
 */
exports.addToBlacklist = async ({ accountId, accountIdentifier, reason, evidence }) => {
  try {
    let account = null;

    if (accountId) {
      account = await Account.findById(accountId).lean();
    }

    if (!account && accountIdentifier) {
      const identifier = accountIdentifier.trim();
      account = await Account.findOne({
        $or: [
          { username: identifier },
          { email: identifier },
          { phone_number: identifier },
        ],
      }).lean();
    }

    if (!account) {
      throw new Error("Không tìm thấy tài khoản phù hợp");
    }

    const existing = await Blacklist.findOne({ account_id: account._id });
    if (existing) {
      throw new Error("Tài khoản này đã nằm trong danh sách đen");
    }

    const blacklist = await Blacklist.create({
      account_id: account._id,
      reason,
      evidence,
    });

    const populated = await Blacklist.findById(blacklist._id)
      .populate({
        path: "account_id",
        select: "username email phone_number role status",
      })
      .lean();

    const user = await User.findOne({ account_id: account._id })
      .select("account_id full_name")
      .lean();

    const userMap = {};
    if (user) {
      userMap[user.account_id?.toString()] = user;
    }

    return formatBlacklistRecord(populated, userMap);
  } catch (error) {
    console.error("Error in addToBlacklist:", error);
    throw error;
  }
};

/**
 * Xóa tài khoản khỏi blacklist
 */
exports.removeFromBlacklist = async ({ blacklistId }) => {
  try {
    const result = await Blacklist.findByIdAndDelete(blacklistId);
    if (!result) {
      throw new Error("Không tìm thấy bản ghi blacklist");
    }
    return true;
  } catch (error) {
    console.error("Error in removeFromBlacklist:", error);
    throw error;
  }
};
