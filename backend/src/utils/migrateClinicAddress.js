const Clinic = require("../model/clinic/Clinic");
const AddressDetail = require("../model/address/AddressDetail");

/**
 * Migration script để chuyển đổi dữ liệu địa chỉ cũ sang cấu trúc mới
 * Chạy script này một lần sau khi cập nhật model
 */
const migrateClinicAddresses = async () => {
    try {
        console.log("🚀 Bắt đầu migration địa chỉ clinic...");

        // Lấy tất cả clinic có address_id cũ
        const clinics = await Clinic.find({
            address_id: { $exists: true, $ne: null }
        });

        console.log(`📊 Tìm thấy ${clinics.length} clinic cần migration`);

        let migratedCount = 0;
        let errorCount = 0;

        for (const clinic of clinics) {
            try {
                // Tìm AddressDetail tương ứng
                const addressDetail = await AddressDetail.findOne({
                    refType: "clinic",
                    refId: clinic._id
                });

                if (addressDetail) {
                    // Cập nhật clinic với địa chỉ mới
                    await Clinic.findByIdAndUpdate(clinic._id, {
                        $set: {
                            address: {
                                province: addressDetail.province,
                                ward: addressDetail.ward,
                                district: addressDetail.district,
                                houseNumber: addressDetail.houseNumber,
                                street: addressDetail.street,
                                alley: addressDetail.alley,
                                building: addressDetail.building,
                                apartment: addressDetail.apartment,
                                fullAddress: addressDetail.fullAddress,
                                coordinates: addressDetail.coordinates
                            }
                        },
                        $unset: {
                            address_id: 1,
                            longitude: 1,
                            latitude: 1
                        }
                    });

                    migratedCount++;
                    console.log(`✅ Đã migration clinic: ${clinic.name}`);
                } else {
                    console.log(`⚠️ Không tìm thấy AddressDetail cho clinic: ${clinic.name}`);
                }

            } catch (error) {
                errorCount++;
                console.error(`❌ Lỗi migration clinic ${clinic.name}:`, error.message);
            }
        }

        console.log(`🎉 Hoàn thành migration:`);
        console.log(`   - Thành công: ${migratedCount}`);
        console.log(`   - Lỗi: ${errorCount}`);
        console.log(`   - Tổng: ${clinics.length}`);

    } catch (error) {
        console.error("❌ Lỗi migration:", error);
        throw error;
    }
};

/**
 * Rollback migration (khôi phục dữ liệu cũ)
 */
const rollbackClinicAddresses = async () => {
    try {
        console.log("🔄 Bắt đầu rollback migration...");

        const clinics = await Clinic.find({
            "address.province": { $exists: true }
        });

        console.log(`📊 Tìm thấy ${clinics.length} clinic cần rollback`);

        for (const clinic of clinics) {
            // Tạo AddressDetail từ dữ liệu mới
            const addressDetail = new AddressDetail({
                refType: "clinic",
                refId: clinic._id,
                province: clinic.address.province,
                ward: clinic.address.ward,
                district: clinic.address.district,
                houseNumber: clinic.address.houseNumber,
                street: clinic.address.street,
                alley: clinic.address.alley,
                building: clinic.address.building,
                apartment: clinic.address.apartment,
                fullAddress: clinic.address.fullAddress,
                coordinates: clinic.address.coordinates,
                isPrimary: true
            });

            await addressDetail.save();

            // Cập nhật clinic với address_id
            await Clinic.findByIdAndUpdate(clinic._id, {
                $set: {
                    address_id: addressDetail._id,
                    longitude: clinic.address.coordinates?.coordinates?.[0]?.toString(),
                    latitude: clinic.address.coordinates?.coordinates?.[1]?.toString()
                },
                $unset: {
                    address: 1
                }
            });

            console.log(`✅ Đã rollback clinic: ${clinic.name}`);
        }

        console.log("🎉 Hoàn thành rollback");

    } catch (error) {
        console.error("❌ Lỗi rollback:", error);
        throw error;
    }
};

module.exports = {
    migrateClinicAddresses,
    rollbackClinicAddresses
};


