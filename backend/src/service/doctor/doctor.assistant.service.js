const Assistant = require("../../model/user/Assistant");
const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");

const doctorService = require("../doctor/doctor.service");

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