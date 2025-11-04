const mongoose = require("mongoose");
const Appointment = require("../../model/appointment/Appointment");
const Clinic = require("../../model/clinic/Clinic");

/**
 * Lấy top phòng khám được book nhiều nhất
 */
async function getTopClinics({ limit = 10, statuses = ['SCHEDULED', 'APPROVE', 'COMPLETED'] } = {}) {
    try {
        const pipeline = [
            // 1. Lọc appointments theo status và có clinic_id
            {
                $match: {
                    status: { $in: statuses },
                    clinic_id: { $exists: true, $ne: null }
                }
            },
            // 2. Nhóm theo clinic_id và đếm số lượng booking
            {
                $group: {
                    _id: "$clinic_id",
                    bookingCount: { $sum: 1 }
                }
            },
            // 3. Sắp xếp theo bookingCount giảm dần
            {
                $sort: { bookingCount: -1 }
            },
            // 4. Giới hạn số lượng
            { $limit: limit },
            // 5. Lookup thông tin phòng khám (chỉ lấy ACTIVE)
            {
                $lookup: {
                    from: "clinics",
                    let: { clinicId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$clinicId"] },
                                status: "ACTIVE"
                            }
                        }
                    ],
                    as: "clinicInfo"
                }
            },
            { $unwind: { path: "$clinicInfo", preserveNullAndEmptyArrays: false } },
            // 6. Lookup specialties của phòng khám
            {
                $lookup: {
                    from: "specialties",
                    localField: "clinicInfo.specialties",
                    foreignField: "_id",
                    as: "clinicSpecialties"
                }
            },
            // 7. Định dạng lại dữ liệu
            {
                $project: {
                    _id: 0,
                    clinic: {
                        _id: "$clinicInfo._id",
                        name: "$clinicInfo.name",
                        description: "$clinicInfo.description",
                        logo_url: "$clinicInfo.logo_url",
                        banner_url: "$clinicInfo.banner_url",
                        phone: "$clinicInfo.phone",
                        email: "$clinicInfo.email",
                        website: "$clinicInfo.website",
                        opening_hours: "$clinicInfo.opening_hours",
                        closing_hours: "$clinicInfo.closing_hours",
                        address: {
                            province: "$clinicInfo.address.province",
                            ward: "$clinicInfo.address.ward",
                            houseNumber: "$clinicInfo.address.houseNumber",
                            street: "$clinicInfo.address.street",
                            alley: "$clinicInfo.address.alley",
                            fullAddress: "$clinicInfo.address.fullAddress"
                        },
                        specialties: {
                            $map: {
                                input: "$clinicSpecialties",
                                as: "spec",
                                in: {
                                    _id: "$$spec._id",
                                    name: "$$spec.name",
                                    icon_url: "$$spec.icon_url"
                                }
                            }
                        }
                    },
                    bookingCount: "$bookingCount"
                }
            },
            // 8. Sắp xếp lại theo bookingCount
            {
                $sort: { bookingCount: -1 }
            }
        ];

        const results = await Appointment.aggregate(pipeline);

        return results.map(item => ({
            ...item.clinic,
            bookingCount: item.bookingCount
        }));
    } catch (error) {
        console.error("Error in getTopClinics:", error);
        throw error;
    }
}

module.exports = {
    getTopClinics
};
