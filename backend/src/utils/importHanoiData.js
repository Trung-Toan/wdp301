const { importAddressData } = require("./importAddressData");
const { Province, Ward } = require("../model/address");
const mongoose = require("mongoose");

/**
 * Script để import dữ liệu Hà Nội từ JSON data được cung cấp
 */
const importHanoiData = async () => {
    try {
        console.log("🚀 Bắt đầu import dữ liệu Hà Nội...");

        // Dữ liệu Hà Nội từ user
        const hanoiData = [
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
                    },
                    {
                        "Code": "00025",
                        "FullName": "Phường Giảng Võ",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00070",
                        "FullName": "Phường Hoàn Kiếm",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00082",
                        "FullName": "Phường Cửa Nam",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00091",
                        "FullName": "Phường Phú Thượng",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00097",
                        "FullName": "Phường Hồng Hà",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00103",
                        "FullName": "Phường Tây Hồ",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00118",
                        "FullName": "Phường Bồ Đề",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00127",
                        "FullName": "Phường Việt Hưng",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00136",
                        "FullName": "Phường Phúc Lợi",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00145",
                        "FullName": "Phường Long Biên",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00160",
                        "FullName": "Phường Nghĩa Đô",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00166",
                        "FullName": "Phường Cầu Giấy",
                        "ProvinceCode": "01"
                    },
                    {
                        "Code": "00175",
                        "FullName": "Phường Yên Hòa",
                        "ProvinceCode": "01"
                    }
                ]
            }
        ];

        // Kiểm tra xem dữ liệu đã tồn tại chưa
        const existingProvince = await Province.findOne({ code: "01" });
        if (existingProvince) {
            console.log("⚠️ Tỉnh Hà Nội đã tồn tại trong database");
            console.log("🔄 Đang xóa dữ liệu cũ...");
            await Province.deleteOne({ code: "01" });
            await Ward.deleteMany({ provinceCode: "01" });
        }

        // Import dữ liệu
        await importAddressData(hanoiData);

        // Kiểm tra kết quả
        const importedProvince = await Province.findOne({ code: "01" });
        const importedWards = await Ward.find({ provinceCode: "01" });

        console.log("\n📊 Kết quả import:");
        console.log(`✅ Tỉnh: ${importedProvince.fullName}`);
        console.log(`✅ Số phường/xã: ${importedWards.length}`);
        console.log("\n📋 Danh sách phường/xã đã import:");
        importedWards.forEach((ward, index) => {
            console.log(`${index + 1}. ${ward.fullName} (${ward.code})`);
        });

        console.log("\n🎉 Import dữ liệu Hà Nội hoàn thành!");

    } catch (error) {
        console.error("❌ Lỗi khi import dữ liệu Hà Nội:", error);
        throw error;
    }
};

/**
 * Script để xóa dữ liệu Hà Nội (nếu cần)
 */
const clearHanoiData = async () => {
    try {
        console.log("🧹 Bắt đầu xóa dữ liệu Hà Nội...");
        
        const deletedWards = await Ward.deleteMany({ provinceCode: "01" });
        const deletedProvince = await Province.deleteOne({ code: "01" });
        
        console.log(`✅ Đã xóa ${deletedWards.deletedCount} phường/xã`);
        console.log(`✅ Đã xóa ${deletedProvince.deletedCount} tỉnh`);
        console.log("🎉 Xóa dữ liệu Hà Nội hoàn thành!");
        
    } catch (error) {
        console.error("❌ Lỗi khi xóa dữ liệu Hà Nội:", error);
        throw error;
    }
};

/**
 * Script để xem dữ liệu Hà Nội hiện tại
 */
const viewHanoiData = async () => {
    try {
        console.log("👀 Xem dữ liệu Hà Nội hiện tại...");
        
        const province = await Province.findOne({ code: "01" });
        const wards = await Ward.find({ provinceCode: "01" }).sort({ fullName: 1 });
        
        if (!province) {
            console.log("❌ Không tìm thấy dữ liệu Hà Nội");
            return;
        }
        
        console.log(`\n🏙️ Tỉnh: ${province.fullName} (${province.code})`);
        console.log(`📍 Vùng: ${province.region}`);
        console.log(`📊 Số phường/xã: ${wards.length}`);
        
        console.log("\n📋 Danh sách phường/xã:");
        wards.forEach((ward, index) => {
            console.log(`${index + 1}. ${ward.fullName} (${ward.code}) - ${ward.type}`);
        });
        
    } catch (error) {
        console.error("❌ Lỗi khi xem dữ liệu Hà Nội:", error);
        throw error;
    }
};

// Nếu file được chạy trực tiếp
if (require.main === module) {
    const action = process.argv[2];
    
    // Kết nối database
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/wdp301")
        .then(() => {
            console.log("✅ Đã kết nối database");
            
            switch (action) {
                case "import":
                    return importHanoiData();
                case "clear":
                    return clearHanoiData();
                case "view":
                    return viewHanoiData();
                default:
                    console.log("📖 Cách sử dụng:");
                    console.log("node importHanoiData.js import  - Import dữ liệu Hà Nội");
                    console.log("node importHanoiData.js clear   - Xóa dữ liệu Hà Nội");
                    console.log("node importHanoiData.js view    - Xem dữ liệu Hà Nội");
                    process.exit(0);
            }
        })
        .then(() => {
            console.log("✅ Hoàn thành!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Lỗi:", error);
            process.exit(1);
        });
}

module.exports = {
    importHanoiData,
    clearHanoiData,
    viewHanoiData
};

