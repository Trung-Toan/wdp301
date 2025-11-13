const Complaint = require("../../model/appointment/Complaint");

const formatAccountInfo = (account) => {
    if (!account) return null;
    return {
        id: account._id ? account._id.toString() : undefined,
        username: account.username || null,
        email: account.email || null,
        phone_number: account.phone_number || null,
        role: account.role || null,
        status: account.status || null,
    };
};

const attachTargetAccount = (complaint) => {
    if (!complaint) return complaint;

    let targetAccount = null;

    if (complaint.complaint_type === "DOCTOR") {
        targetAccount = formatAccountInfo(
            complaint.doctor_id?.user_id?.account_id || complaint.doctor_id?.account_id
        );
    } else if (complaint.complaint_type === "CLINIC") {
        targetAccount = formatAccountInfo(
            complaint.clinic_id?.created_by?.user_id?.account_id ||
            complaint.clinic_id?.account_id
        );
    }

    return {
        ...complaint,
        target_account: targetAccount,
    };
};

/**
 * Lấy danh sách tất cả khiếu nại (cho admin system)
 */
exports.getAllComplaints = async ({ page = 1, limit = 10, status, complaint_type, search } = {}) => {
    try {
        const match = {};

        // Filter theo status
        if (status) {
            match.status = status;
        }

        // Filter theo loại khiếu nại (DOCTOR hoặc CLINIC)
        if (complaint_type) {
            match.complaint_type = complaint_type;
        }

        // Search theo title hoặc content
        if (search) {
            match.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const [complaints, total] = await Promise.all([
            Complaint.find(match)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "patient_id",
                    select: "user_id",
                    populate: {
                        path: "user_id",
                        select: "full_name email phone_number account_id",
                        populate: {
                            path: "account_id",
                            select: "username email phone_number role status",
                        },
                    },
                })
                .populate({
                    path: "doctor_id",
                    select: "user_id title",
                    populate: {
                        path: "user_id",
                        select: "full_name account_id",
                        populate: {
                            path: "account_id",
                            select: "username email phone_number role status",
                        },
                    },
                })
                .populate({
                    path: "clinic_id",
                    select: "name address created_by",
                    populate: {
                        path: "created_by",
                        select: "user_id",
                        populate: {
                            path: "user_id",
                            select: "full_name account_id",
                            populate: {
                                path: "account_id",
                                select: "username email phone_number role status",
                            },
                        },
                    },
                })
                .populate("appointment_id", "scheduled_date start_time")
                .populate("resolved_by", "username email")
                .lean(),
            Complaint.countDocuments(match),
        ]);

        const formattedComplaints = complaints.map(attachTargetAccount);

        return {
            data: formattedComplaints,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy chi tiết khiếu nại (cho admin system)
 */
exports.getComplaintById = async (complaintId) => {
    try {
        const complaint = await Complaint.findById(complaintId)
            .populate({
                path: "patient_id",
                select: "user_id",
                populate: {
                    path: "user_id",
                    select: "full_name email phone_number account_id",
                    populate: {
                        path: "account_id",
                        select: "username email phone_number role status",
                    },
                },
            })
            .populate({
                path: "doctor_id",
                select: "user_id title",
                populate: {
                    path: "user_id",
                    select: "full_name account_id",
                    populate: {
                        path: "account_id",
                        select: "username email phone_number role status",
                    },
                },
            })
            .populate({
                path: "clinic_id",
                select: "name address created_by",
                populate: {
                    path: "created_by",
                    select: "user_id",
                    populate: {
                        path: "user_id",
                        select: "full_name account_id",
                        populate: {
                            path: "account_id",
                            select: "username email phone_number role status",
                        },
                    },
                },
            })
            .populate("appointment_id", "scheduled_date start_time")
            .populate("resolved_by", "username email")
            .lean();

        if (!complaint) {
            throw new Error("Không tìm thấy khiếu nại");
        }

        return attachTargetAccount(complaint);
    } catch (error) {
        throw error;
    }
};

/**
 * Cập nhật trạng thái khiếu nại
 */
exports.updateComplaintStatus = async ({ complaintId, status, adminSystemId, resolutionNote, dismissedReason }) => {
    try {
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            throw new Error("Không tìm thấy khiếu nại");
        }

        // Validate status
        const validStatuses = ["PENDING", "IN_REVIEW", "RESOLVED", "DISMISSED"];
        if (!validStatuses.includes(status)) {
            throw new Error("Trạng thái không hợp lệ");
        }

        // Cập nhật status
        complaint.status = status;

        // Nếu resolved, lưu thông tin resolved
        if (status === "RESOLVED") {
            complaint.resolved_by = adminSystemId || null;
            complaint.resolved_at = new Date();
            complaint.resolution_note = resolutionNote || null;
        }

        // Nếu dismissed, lưu lý do
        if (status === "DISMISSED") {
            complaint.dismissed_reason = dismissedReason || null;
        }

        await complaint.save();

        const populatedComplaint = await Complaint.findById(complaint._id)
            .populate({
                path: "patient_id",
                select: "user_id",
                populate: {
                    path: "user_id",
                    select: "full_name email phone_number account_id",
                    populate: {
                        path: "account_id",
                        select: "username email phone_number role status",
                    },
                },
            })
            .populate({
                path: "doctor_id",
                select: "user_id title",
                populate: {
                    path: "user_id",
                    select: "full_name account_id",
                    populate: {
                        path: "account_id",
                        select: "username email phone_number role status",
                    },
                },
            })
            .populate({
                path: "clinic_id",
                select: "name address created_by",
                populate: {
                    path: "created_by",
                    select: "user_id",
                    populate: {
                        path: "user_id",
                        select: "full_name account_id",
                        populate: {
                            path: "account_id",
                            select: "username email phone_number role status",
                        },
                    },
                },
            })
            .populate("appointment_id", "scheduled_date start_time")
            .populate("resolved_by", "username email")
            .lean();

        return attachTargetAccount(populatedComplaint);
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy thống kê khiếu nại
 */
exports.getComplaintStats = async () => {
    try {
        const [total, pending, inReview, resolved, dismissed, byDoctor, byClinic] = await Promise.all([
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: "PENDING" }),
            Complaint.countDocuments({ status: "IN_REVIEW" }),
            Complaint.countDocuments({ status: "RESOLVED" }),
            Complaint.countDocuments({ status: "DISMISSED" }),
            Complaint.countDocuments({ complaint_type: "DOCTOR" }),
            Complaint.countDocuments({ complaint_type: "CLINIC" }),
        ]);

        return {
            total,
            pending,
            inReview,
            resolved,
            dismissed,
            byDoctor,
            byClinic,
        };
    } catch (error) {
        throw error;
    }
};

