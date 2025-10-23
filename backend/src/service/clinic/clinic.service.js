const Clinic = require("../../model/clinic/Clinic");

/**
 * Lấy tất cả phòng khám với đầy đủ thông tin cần thiết
 * Có thể lọc theo status và tìm kiếm theo từ khóa q
 */
async function getAllClinic({ status, q } = {}) {
    const filter = {};

    // Lọc theo trạng thái
    if (status) filter.status = status;

    // Tìm kiếm theo tên hoặc mô tả
    if (q) {
        const rx = new RegExp(q.trim(), "i");
        filter.$or = [{ name: rx }, { description: rx }];
    }

    // Truy vấn clinic cùng với các bảng liên quan
    const clinics = await Clinic.find(filter)
        .populate({
            path: "specialties",
            select: "_id name description icon_url",
        })
        .populate({
            path: "created_by",
            select: "_id name email",
        })
        .populate({
            path: "address_detail",
            select: "province ward district houseNumber street alley fullAddress",
        })
        .sort({ name: 1 })
        .lean();

    // Trả về dữ liệu được xử lý gọn gàng
    return clinics.map((clinic) => ({
        id: clinic._id,
        name: clinic.name,
        phone: clinic.phone,
        email: clinic.email,
        website: clinic.website,
        description: clinic.description,
        logo_url: clinic.logo_url,
        banner_url: clinic.banner_url,
        registration_number: clinic.registration_number,
        opening_hours: clinic.opening_hours,
        closing_hours: clinic.closing_hours,
        status: clinic.status,
        option: clinic.option,
        created_by: clinic.created_by
            ? {
                id: clinic.created_by._id,
                name: clinic.created_by.name,
                email: clinic.created_by.email,
            }
            : null,
        address: clinic.address || null,
        address_detail: clinic.address_detail || null,
        specialties: clinic.specialties?.map((s) => ({
            id: s._id,
            name: s.name,
            description: s.description,
            icon_url: s.icon_url,
        })),
        createdAt: clinic.createdAt,
        updatedAt: clinic.updatedAt,
    }));
}

module.exports = { getAllClinic };
