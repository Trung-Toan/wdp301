const License = require("../../model/clinic/License");
const Doctor = require("../../model/doctor/Doctor");
const User = require("../../model/user/User");

/**
 * Lấy danh sách tất cả licenses với filter và pagination
 * @param {Object} options - { status, search, page, limit }
 */
exports.getAllLicenses = async ({ status, search, page = 1, limit = 10 }) => {
    try {
        const query = {};

        // Filter theo status
        let isExpiringFilter = false;
        if (status && status !== "all") {
            // Map frontend status sang backend status
            if (status === "expiring") {
                query.status = "APPROVED"; // Chỉ lấy APPROVED, sau đó filter theo expiry_date
                isExpiringFilter = true;
            } else {
                const statusMap = {
                    valid: "APPROVED",
                    expired: "EXPIRED",
                    pending: "PENDING",
                    rejected: "REJECTED"
                };
                query.status = statusMap[status] || status;
            }
        }

        // Search theo tên bác sĩ hoặc số chứng chỉ
        if (search) {
            // Tìm users có tên match
            const users = await User.find({
                full_name: { $regex: search, $options: "i" }
            })
            .select("_id")
            .lean();

            const userIds = users.map(u => u._id);

            // Tìm doctors có user_id match hoặc title match
            let doctorIds = [];
            if (userIds.length > 0) {
                const doctors = await Doctor.find({
                    $or: [
                        { user_id: { $in: userIds } },
                        { title: { $regex: search, $options: "i" } }
                    ]
                })
                .select("_id")
                .lean();
                doctorIds = doctors.map(doc => doc._id);
            } else {
                const doctors = await Doctor.find({
                    title: { $regex: search, $options: "i" }
                })
                .select("_id")
                .lean();
                doctorIds = doctors.map(doc => doc._id);
            }

            // Tìm licenses có licenseNumber match hoặc doctor_id match
            if (doctorIds.length > 0) {
                query.$or = [
                    { licenseNumber: { $regex: search, $options: "i" } },
                    { doctor_id: { $in: doctorIds } }
                ];
            } else {
                query.licenseNumber = { $regex: search, $options: "i" };
            }
        }

        const skip = (page - 1) * limit;

        // Lấy licenses với populate
        let licenses = await License.find(query)
            .populate({
                path: "doctor_id",
                select: "title user_id clinic_id",
                populate: [
                    {
                        path: "user_id",
                        select: "full_name"
                    },
                    {
                        path: "clinic_id",
                        select: "name"
                    }
                ]
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Filter licenses sắp hết hạn (nếu status = "expiring")
        if (isExpiringFilter) {
            const now = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(now.getDate() + 30);
            
            licenses = licenses.filter(license => {
                const expiryDate = new Date(license.expiry_date);
                return expiryDate >= now && expiryDate <= thirtyDaysFromNow && license.status === "APPROVED";
            });
        }

        // Format data cho frontend
        const formattedLicenses = licenses.map(license => {
            const expiryDate = new Date(license.expiry_date);
            const now = new Date();
            let displayStatus = license.status.toLowerCase();
            
            // Nếu status là APPROVED, kiểm tra xem có sắp hết hạn không
            if (license.status === "APPROVED") {
                const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                    displayStatus = "expiring";
                } else if (daysUntilExpiry <= 0) {
                    displayStatus = "expired";
                } else {
                    displayStatus = "valid";
                }
            }

            return {
                id: license._id.toString(),
                _id: license._id.toString(),
                doctorName: license.doctor_id?.user_id?.full_name 
                    ? `${license.doctor_id?.title || ""} ${license.doctor_id.user_id.full_name}`.trim()
                    : "Không rõ",
                doctorId: license.doctor_id?._id?.toString(),
                licenseNumber: license.licenseNumber,
                issued_by: license.issued_by,
                issued_date: license.issued_date,
                expiry_date: license.expiry_date,
                document_url: license.document_url,
                status: displayStatus,
                originalStatus: license.status,
                clinic_name: license.doctor_id?.clinic_id?.name || "Chưa có phòng khám",
                approved_at: license.approved_at,
                rejected_reason: license.rejected_reason,
                createdAt: license.createdAt,
                updatedAt: license.updatedAt
            };
        });

        const total = await License.countDocuments(query);

        return {
            licenses: formattedLicenses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error("Error in getAllLicenses:", error);
        throw error;
    }
};

/**
 * Lấy chi tiết license theo ID
 */
exports.getLicenseById = async (licenseId) => {
    try {
        const license = await License.findById(licenseId)
            .populate({
                path: "doctor_id",
                select: "title user_id clinic_id specialty_id",
                populate: [
                    {
                        path: "user_id",
                        select: "full_name email phone_number"
                    },
                    {
                        path: "clinic_id",
                        select: "name address"
                    },
                    {
                        path: "specialty_id",
                        select: "name"
                    }
                ]
            })
            .populate({
                path: "approved_by",
                select: "user_id",
                populate: {
                    path: "user_id",
                    select: "full_name"
                }
            })
            .lean();

        if (!license) {
            throw new Error("Không tìm thấy chứng chỉ");
        }

        return license;
    } catch (error) {
        console.error("Error in getLicenseById:", error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái license (Approve/Reject)
 */
exports.updateLicenseStatus = async ({ licenseId, status, adminSystemId, rejectionReason }) => {
    try {
        const license = await License.findById(licenseId);
        
        if (!license) {
            throw new Error("Không tìm thấy chứng chỉ");
        }

        if (status === "APPROVED") {
            license.status = "APPROVED";
            license.approved_at = new Date();
            license.rejected_reason = null;
        } else if (status === "REJECTED") {
            license.status = "REJECTED";
            license.rejected_reason = rejectionReason || "Không đáp ứng yêu cầu";
            license.approved_at = null;
        } else {
            throw new Error("Trạng thái không hợp lệ");
        }

        await license.save();
        return license;
    } catch (error) {
        console.error("Error in updateLicenseStatus:", error);
        throw error;
    }
};

