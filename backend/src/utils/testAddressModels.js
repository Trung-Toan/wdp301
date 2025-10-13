const { Province, Ward, AddressDetail } = require("../model/address");
const Clinic = require("../model/clinic/Clinic");

/**
 * Script test để kiểm tra các model địa chỉ mới
 */
const testAddressModels = async () => {
    try {
        console.log("🧪 Bắt đầu test các model địa chỉ...");

        // Test 1: Tạo Province
        console.log("\n1️⃣ Test tạo Province...");
        const province = new Province({
            code: "01",
            fullName: "Thành phố Hà Nội",
            shortName: "Hà Nội",
            type: "Thành phố",
            region: "Miền Bắc"
        });

        await province.save();
        console.log("✅ Province đã được tạo:", province.fullName);

        // Test 2: Tạo Ward
        console.log("\n2️⃣ Test tạo Ward...");
        const ward = new Ward({
            code: "00004",
            fullName: "Phường Ba Đình",
            shortName: "Ba Đình",
            type: "Phường",
            provinceCode: "01"
        });

        await ward.save();
        console.log("✅ Ward đã được tạo:", ward.fullName);

        // Test 3: Tạo Clinic với địa chỉ mới
        console.log("\n3️⃣ Test tạo Clinic với địa chỉ mới...");
        const clinic = new Clinic({
            name: "Phòng khám Test",
            phone: "0123456789",
            email: "test@clinic.com",
            tax_code: "123456789",
            registration_number: "REG001",
            opening_hours: "08:00",
            closing_hours: "17:00",
            created_by: "507f1f77bcf86cd799439011", // ObjectId giả
            address: {
                province: {
                    code: "01",
                    name: "Thành phố Hà Nội"
                },
                ward: {
                    code: "00004",
                    name: "Phường Ba Đình"
                },
                houseNumber: "123",
                street: "Đường ABC",
                coordinates: {
                    type: "Point",
                    coordinates: [105.8342, 21.0278] // [longitude, latitude]
                }
            }
        });

        await clinic.save();
        console.log("✅ Clinic đã được tạo:", clinic.name);
        console.log("📍 Địa chỉ đầy đủ:", clinic.address.fullAddress);

        // Test 4: Tìm kiếm clinic theo địa chỉ
        console.log("\n4️⃣ Test tìm kiếm clinic theo địa chỉ...");
        const clinicsInHanoi = await Clinic.find({
            "address.province.code": "01"
        });
        console.log(`✅ Tìm thấy ${clinicsInHanoi.length} clinic ở Hà Nội`);

        // Test 5: Tìm kiếm clinic gần vị trí
        console.log("\n5️⃣ Test tìm kiếm clinic gần vị trí...");
        const nearbyClinics = await Clinic.find({
            "address.coordinates.coordinates": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [105.8342, 21.0278]
                    },
                    $maxDistance: 1000 // 1km
                }
            }
        });
        console.log(`✅ Tìm thấy ${nearbyClinics.length} clinic trong bán kính 1km`);

        console.log("\n🎉 Tất cả test đều thành công!");

        // Cleanup - xóa dữ liệu test
        await Province.deleteOne({ code: "01" });
        await Ward.deleteOne({ code: "00004" });
        await Clinic.deleteOne({ name: "Phòng khám Test" });
        console.log("🧹 Đã dọn dẹp dữ liệu test");

    } catch (error) {
        console.error("❌ Lỗi trong quá trình test:", error);
        throw error;
    }
};

/**
 * Test import dữ liệu từ JSON
 */
const testImportData = async () => {
    try {
        console.log("🧪 Test import dữ liệu từ JSON...");

        // Dữ liệu mẫu từ ảnh
        const sampleData = [
            {
                "Code": "01",
                "FullName": "Thành phố Hà Nội",
                "Wards": [
                    {
                        "Code": "00004",
                        "FullName": "Phường Ba Đình",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00008",
                        "FullName": "Phường Ngọc Hà",
                        "ProvinceCode": "01"
                    }
                ]
            }
        ];

        const { importAddressData } = require("./importAddressData");
        await importAddressData(sampleData);

        console.log("✅ Import dữ liệu thành công!");

        // Kiểm tra dữ liệu đã import
        const provinces = await Province.find();
        const wards = await Ward.find();

        console.log(`📊 Đã import: ${provinces.length} tỉnh, ${wards.length} phường/xã`);

        // Cleanup
        await Province.deleteMany({});
        await Ward.deleteMany({});
        console.log("🧹 Đã dọn dẹp dữ liệu test");

    } catch (error) {
        console.error("❌ Lỗi test import:", error);
        throw error;
    }
};

module.exports = {
    testAddressModels,
    testImportData
};


