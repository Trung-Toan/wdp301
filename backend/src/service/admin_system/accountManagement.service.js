const Account = require('../../model/auth/Account');
const User = require('../../model/user/User');
const AdminClinic = require('../../model/user/AdminClinic');

/**
 * Lấy danh sách ADMIN_CLINIC với filter
 * @param {Object} options - { status, role, search, page, limit }
 */
exports.getAdminClinicAccounts = async ({ status, search, page = 1, limit = 10 }) => {
    try {
        const query = { role: 'ADMIN_CLINIC' };

        // Filter theo status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Search theo username, email
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const accounts = await Account.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Account.countDocuments(query);

        // Lấy thông tin User và AdminClinic cho mỗi account
        const accountsWithDetails = await Promise.all(
            accounts.map(async (account) => {
                const user = await User.findOne({ account_id: account._id })
                    .select('full_name dob gender address')
                    .lean();

                const adminClinic = await AdminClinic.findOne({ user_id: user?._id })
                    .lean();

                return {
                    ...account,
                    user: user || null,
                    adminClinic: adminClinic || null,
                    joinDate: account.createdAt
                };
            })
        );

        return {
            accounts: accountsWithDetails,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Error getting admin clinic accounts:', error);
        throw error;
    }
};

/**
 * Lấy danh sách ADMIN_CLINIC đang chờ phê duyệt (status = PENDING)
 */
exports.getPendingAdminClinicAccounts = async ({ page = 1, limit = 10 }) => {
    return exports.getAdminClinicAccounts({ status: 'PENDING', page, limit });
};

/**
 * Phê duyệt ADMIN_CLINIC (chuyển status từ PENDING -> ACTIVE)
 * @param {String} accountId - Account ID
 * @param {String} adminSystemId - Admin System ID đang phê duyệt
 */
exports.approveAdminClinic = async ({ accountId, adminSystemId }) => {
    try {
        const account = await Account.findById(accountId);
        if (!account) {
            throw new Error('Account not found');
        }

        if (account.role !== 'ADMIN_CLINIC') {
            throw new Error('Account is not ADMIN_CLINIC');
        }

        if (account.status !== 'PENDING') {
            throw new Error(`Cannot approve account with status: ${account.status}`);
        }

        account.status = 'ACTIVE';
        await account.save();

        return {
            account: account.toObject(),
            message: 'Admin clinic approved successfully'
        };
    } catch (error) {
        console.error('Error approving admin clinic:', error);
        throw error;
    }
};

/**
 * Từ chối ADMIN_CLINIC (chuyển status từ PENDING -> REJECTED)
 * @param {String} accountId - Account ID
 * @param {String} adminSystemId - Admin System ID đang từ chối
 * @param {String} rejectionReason - Lý do từ chối
 */
exports.rejectAdminClinic = async ({ accountId, adminSystemId, rejectionReason }) => {
    try {
        const account = await Account.findById(accountId);
        if (!account) {
            throw new Error('Account not found');
        }

        if (account.role !== 'ADMIN_CLINIC') {
            throw new Error('Account is not ADMIN_CLINIC');
        }

        if (account.status !== 'PENDING') {
            throw new Error(`Cannot reject account with status: ${account.status}`);
        }

        account.status = 'REJECTED';
        await account.save();

        return {
            account: account.toObject(),
            rejectionReason,
            message: 'Admin clinic rejected successfully'
        };
    } catch (error) {
        console.error('Error rejecting admin clinic:', error);
        throw error;
    }
};

/**
 * Ban ADMIN_CLINIC (chuyển status -> SUSPENDED)
 * @param {String} accountId - Account ID
 * @param {String} adminSystemId - Admin System ID đang ban
 */
exports.banAdminClinic = async ({ accountId, adminSystemId }) => {
    try {
        const account = await Account.findById(accountId);
        if (!account) {
            throw new Error('Account not found');
        }

        if (account.role !== 'ADMIN_CLINIC') {
            throw new Error('Account is not ADMIN_CLINIC');
        }

        account.status = 'SUSPENDED';
        await account.save();

        return {
            account: account.toObject(),
            message: 'Admin clinic banned successfully'
        };
    } catch (error) {
        console.error('Error banning admin clinic:', error);
        throw error;
    }
};

/**
 * Unban ADMIN_CLINIC (chuyển status từ SUSPENDED -> ACTIVE)
 * @param {String} accountId - Account ID
 * @param {String} adminSystemId - Admin System ID đang unban
 */
exports.unbanAdminClinic = async ({ accountId, adminSystemId }) => {
    try {
        const account = await Account.findById(accountId);
        if (!account) {
            throw new Error('Account not found');
        }

        if (account.role !== 'ADMIN_CLINIC') {
            throw new Error('Account is not ADMIN_CLINIC');
        }

        if (account.status !== 'SUSPENDED') {
            throw new Error(`Cannot unban account with status: ${account.status}`);
        }

        account.status = 'ACTIVE';
        await account.save();

        return {
            account: account.toObject(),
            message: 'Admin clinic unbanned successfully'
        };
    } catch (error) {
        console.error('Error unbanning admin clinic:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết ADMIN_CLINIC account
 * @param {String} accountId - Account ID
 */
exports.getAdminClinicDetail = async ({ accountId }) => {
    try {
        const account = await Account.findById(accountId)
            .select('-password')
            .lean();

        if (!account) {
            throw new Error('Account not found');
        }

        if (account.role !== 'ADMIN_CLINIC') {
            throw new Error('Account is not ADMIN_CLINIC');
        }

        const user = await User.findOne({ account_id: account._id })
            .select('full_name dob gender address avatar_url')
            .lean();

        const adminClinic = await AdminClinic.findOne({ user_id: user?._id })
            .lean();

        return {
            account,
            user: user || null,
            adminClinic: adminClinic || null
        };
    } catch (error) {
        console.error('Error getting admin clinic detail:', error);
        throw error;
    }
};

