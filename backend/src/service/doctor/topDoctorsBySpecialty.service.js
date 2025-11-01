const mongoose = require("mongoose");
const Appointment = require("../../model/appointment/Appointment");
const Doctor = require("../../model/doctor/Doctor");
const Specialty = require("../../model/clinic/Specialty");

/**
 * Lấy top bác sĩ được book nhiều nhất theo từng chuyên ngành
 * @param {Object} options - Các tùy chọn
 * @param {number} options.limit - Số lượng bác sĩ tối đa cho mỗi chuyên ngành (mặc định: 10)
 * @param {Array<string>} options.statuses - Các trạng thái appointment để đếm (mặc định: ['SCHEDULED', 'APPROVE', 'COMPLETED'])
 * @returns {Promise<Array>} Danh sách các chuyên ngành với top bác sĩ
 */
async function getTopDoctorsBySpecialty({ limit = 10, statuses = ['SCHEDULED', 'APPROVE', 'COMPLETED'] } = {}) {
    try {
        // Pipeline aggregation để đếm số lượng booking theo specialty_id và doctor_id
        const pipeline = [
            // 1. Lọc appointments theo status (bỏ CANCELLED và NO_SHOW)
            {
                $match: {
                    status: { $in: statuses }
                }
            },
            // 2. Nhóm theo specialty_id và doctor_id, đếm số lượng booking
            {
                $group: {
                    _id: {
                        specialty_id: "$specialty_id",
                        doctor_id: "$doctor_id"
                    },
                    bookingCount: { $sum: 1 }
                }
            },
            // 3. Sắp xếp theo specialty_id và bookingCount giảm dần
            {
                $sort: {
                    "_id.specialty_id": 1,
                    bookingCount: -1
                }
            },
            // 4. Nhóm lại theo specialty_id để giới hạn số lượng bác sĩ mỗi chuyên ngành
            {
                $group: {
                    _id: "$_id.specialty_id",
                    doctors: {
                        $push: {
                            doctor_id: "$_id.doctor_id",
                            bookingCount: "$bookingCount"
                        }
                    }
                }
            },
            // 5. Giới hạn số lượng bác sĩ cho mỗi chuyên ngành
            {
                $project: {
                    specialty_id: "$_id",
                    doctors: { $slice: ["$doctors", limit] }
                }
            },
            // 6. Unwind để có thể join với collections khác
            {
                $unwind: "$doctors"
            },
            // 7. Lookup thông tin bác sĩ
            {
                $lookup: {
                    from: "doctors",
                    localField: "doctors.doctor_id",
                    foreignField: "_id",
                    as: "doctorInfo"
                }
            },
            { $unwind: "$doctorInfo" },
            // 8. Lookup thông tin user (tên, avatar)
            {
                $lookup: {
                    from: "users",
                    localField: "doctorInfo.user_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
            // 9. Lookup thông tin phòng khám
            {
                $lookup: {
                    from: "clinics",
                    localField: "doctorInfo.clinic_id",
                    foreignField: "_id",
                    as: "clinicInfo"
                }
            },
            { $unwind: { path: "$clinicInfo", preserveNullAndEmptyArrays: true } },
            // 10. Lookup thông tin chuyên ngành
            {
                $lookup: {
                    from: "specialties",
                    localField: "specialty_id",
                    foreignField: "_id",
                    as: "specialtyInfo"
                }
            },
            { $unwind: { path: "$specialtyInfo", preserveNullAndEmptyArrays: true } },
            // 11. Lookup specialties của bác sĩ
            {
                $lookup: {
                    from: "specialties",
                    localField: "doctorInfo.specialty_id",
                    foreignField: "_id",
                    as: "doctorSpecialties"
                }
            },
            // 12. Định dạng lại dữ liệu
            {
                $project: {
                    _id: 0,
                    specialty: {
                        _id: "$specialty_id",
                        name: "$specialtyInfo.name",
                        description: "$specialtyInfo.description",
                        icon_url: "$specialtyInfo.icon_url"
                    },
                    doctor: {
                        _id: "$doctors.doctor_id",
                        full_name: "$userInfo.full_name",
                        avatar_url: "$userInfo.avatar_url",
                        title: "$doctorInfo.title",
                        degree: "$doctorInfo.degree",
                        description: "$doctorInfo.description",
                        experience: "$doctorInfo.experience",
                        specialties: "$doctorSpecialties",
                        clinic: {
                            _id: "$clinicInfo._id",
                            name: "$clinicInfo.name",
                            address: "$clinicInfo.address"
                        }
                    },
                    bookingCount: "$doctors.bookingCount"
                }
            },
            // 13. Sắp xếp lại theo specialty và bookingCount
            {
                $sort: {
                    "specialty.name": 1,
                    bookingCount: -1
                }
            }
        ];

        const results = await Appointment.aggregate(pipeline);

        // Nhóm lại theo specialty để trả về dạng object
        const groupedBySpecialty = {};

        results.forEach(item => {
            const specialtyId = item.specialty._id.toString();

            if (!groupedBySpecialty[specialtyId]) {
                groupedBySpecialty[specialtyId] = {
                    specialty: item.specialty,
                    doctors: []
                };
            }

            // Format doctor specialties
            const doctorSpecialties = (item.doctor.specialties || []).map(s => ({
                _id: s._id,
                name: s.name,
                icon_url: s.icon_url
            }));

            groupedBySpecialty[specialtyId].doctors.push({
                ...item.doctor,
                specialties: doctorSpecialties,
                bookingCount: item.bookingCount
            });
        });

        // Chuyển thành array và sort lại
        const finalResult = Object.values(groupedBySpecialty);

        // Sort theo tên chuyên ngành
        finalResult.sort((a, b) => {
            const nameA = a.specialty.name || '';
            const nameB = b.specialty.name || '';
            return nameA.localeCompare(nameB);
        });

        return finalResult;
    } catch (error) {
        console.error("Error in getTopDoctorsBySpecialty:", error);
        throw error;
    }
}

/**
 * Lấy top bác sĩ được book nhiều nhất cho một chuyên ngành cụ thể
 * @param {string} specialtyId - ID của chuyên ngành
 * @param {Object} options - Các tùy chọn
 * @param {number} options.limit - Số lượng bác sĩ tối đa (mặc định: 10)
 * @param {Array<string>} options.statuses - Các trạng thái appointment để đếm (mặc định: ['SCHEDULED', 'APPROVE', 'COMPLETED'])
 * @returns {Promise<Object>} Thông tin chuyên ngành và danh sách top bác sĩ
 */
async function getTopDoctorsBySingleSpecialty(specialtyId, { limit = 10, statuses = ['SCHEDULED', 'APPROVE', 'COMPLETED'] } = {}) {
    try {
        if (!mongoose.Types.ObjectId.isValid(specialtyId)) {
            throw new Error("Invalid specialty ID");
        }

        const pipeline = [
            // 1. Lọc appointments theo specialty_id và status
            {
                $match: {
                    specialty_id: new mongoose.Types.ObjectId(specialtyId),
                    status: { $in: statuses }
                }
            },
            // 2. Nhóm theo doctor_id và đếm số lượng booking
            {
                $group: {
                    _id: "$doctor_id",
                    bookingCount: { $sum: 1 }
                }
            },
            // 3. Sắp xếp theo bookingCount giảm dần
            {
                $sort: { bookingCount: -1 }
            },
            // 4. Giới hạn số lượng
            { $limit: limit },
            // 5. Lookup thông tin bác sĩ
            {
                $lookup: {
                    from: "doctors",
                    localField: "_id",
                    foreignField: "_id",
                    as: "doctorInfo"
                }
            },
            { $unwind: "$doctorInfo" },
            // 6. Lookup thông tin user
            {
                $lookup: {
                    from: "users",
                    localField: "doctorInfo.user_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
            // 7. Lookup thông tin phòng khám
            {
                $lookup: {
                    from: "clinics",
                    localField: "doctorInfo.clinic_id",
                    foreignField: "_id",
                    as: "clinicInfo"
                }
            },
            { $unwind: { path: "$clinicInfo", preserveNullAndEmptyArrays: true } },
            // 8. Lookup specialties của bác sĩ
            {
                $lookup: {
                    from: "specialties",
                    localField: "doctorInfo.specialty_id",
                    foreignField: "_id",
                    as: "doctorSpecialties"
                }
            },
            // 10. Định dạng lại dữ liệu
            {
                $project: {
                    _id: 0,
                    doctor: {
                        _id: "$_id",
                        full_name: "$userInfo.full_name",
                        avatar_url: "$userInfo.avatar_url",
                        title: "$doctorInfo.title",
                        degree: "$doctorInfo.degree",
                        description: "$doctorInfo.description",
                        experience: "$doctorInfo.experience",
                        specialties: {
                            $map: {
                                input: "$doctorSpecialties",
                                as: "spec",
                                in: {
                                    _id: "$$spec._id",
                                    name: "$$spec.name",
                                    icon_url: "$$spec.icon_url"
                                }
                            }
                        },
                        clinic: {
                            _id: "$clinicInfo._id",
                            name: "$clinicInfo.name",
                            address: "$clinicInfo.address"
                        }
                    },
                    bookingCount: "$bookingCount"
                }
            }
        ];

        const doctors = await Appointment.aggregate(pipeline);

        // Lấy thông tin chuyên ngành
        const specialty = await Specialty.findById(specialtyId).lean();

        return {
            specialty: specialty ? {
                _id: specialty._id,
                name: specialty.name,
                description: specialty.description,
                icon_url: specialty.icon_url
            } : null,
            doctors: doctors.map(item => ({
                ...item.doctor,
                bookingCount: item.bookingCount
            }))
        };
    } catch (error) {
        console.error("Error in getTopDoctorsBySingleSpecialty:", error);
        throw error;
    }
}

module.exports = {
    getTopDoctorsBySpecialty,
    getTopDoctorsBySingleSpecialty
};

