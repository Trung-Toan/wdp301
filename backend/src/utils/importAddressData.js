const Province = require("../model/address/Province");
const Ward = require("../model/address/Ward");

/**
 * Import dữ liệu địa chỉ từ JSON structure như trong ảnh
 * @param {Array} jsonData - Mảng chứa dữ liệu tỉnh/thành phố và phường/xã
 */
const importAddressData = async (jsonData) => {
    try {
        console.log("🚀 Bắt đầu import dữ liệu địa chỉ...");

        let totalProvinces = 0;
        let totalWards = 0;

        for (const provinceData of jsonData) {
            // Tạo Province
            const province = await Province.create({
                code: provinceData.Code,
                fullName: provinceData.FullName,
                shortName: extractShortName(provinceData.FullName),
                type: provinceData.FullName.includes("Thành phố") ? "Thành phố" : "Tỉnh",
                region: getRegionByProvince(provinceData.Code)
            });

            totalProvinces++;
            console.log(`✅ Đã tạo tỉnh: ${province.fullName}`);

            // Tạo các Ward
            if (provinceData.Wards && Array.isArray(provinceData.Wards)) {
                for (const wardData of provinceData.Wards) {
                    await Ward.create({
                        code: wardData.Code,
                        fullName: wardData.FullName,
                        shortName: extractShortName(wardData.FullName),
                        type: getWardType(wardData.FullName),
                        provinceCode: wardData.ProvinceCode
                    });

                    totalWards++;
                }
                console.log(`✅ Đã tạo ${provinceData.Wards.length} phường/xã cho ${province.fullName}`);
            }
        }

        console.log(`🎉 Hoàn thành import: ${totalProvinces} tỉnh/thành phố, ${totalWards} phường/xã`);

    } catch (error) {
        console.error("❌ Lỗi khi import dữ liệu địa chỉ:", error);
        throw error;
    }
};

/**
 * Trích xuất tên ngắn từ tên đầy đủ
 * @param {string} fullName - Tên đầy đủ
 * @returns {string} - Tên ngắn
 */
const extractShortName = (fullName) => {
    if (!fullName) return "";

    // Loại bỏ các từ như "Thành phố", "Tỉnh", "Phường", "Xã", "Thị trấn"
    const prefixes = ["Thành phố", "Tỉnh", "Phường", "Xã", "Thị trấn"];

    let shortName = fullName;
    for (const prefix of prefixes) {
        if (shortName.startsWith(prefix)) {
            shortName = shortName.substring(prefix.length).trim();
            break;
        }
    }

    return shortName;
};

/**
 * Xác định loại phường/xã từ tên đầy đủ
 * @param {string} fullName - Tên đầy đủ
 * @returns {string} - Loại phường/xã
 */
const getWardType = (fullName) => {
    if (fullName.includes("Phường")) return "Phường";
    if (fullName.includes("Xã")) return "Xã";
    if (fullName.includes("Thị trấn")) return "Thị trấn";
    return "Phường"; // Default
};

/**
 * Xác định vùng miền dựa trên mã tỉnh
 * @param {string} provinceCode - Mã tỉnh
 * @returns {string} - Vùng miền
 */
const getRegionByProvince = (provinceCode) => {
    const code = parseInt(provinceCode);

    // Miền Bắc: 01-30
    if (code >= 1 && code <= 30) return "Miền Bắc";

    // Miền Trung: 31-60
    if (code >= 31 && code <= 60) return "Miền Trung";

    // Miền Nam: 61-96
    if (code >= 61 && code <= 96) return "Miền Nam";

    return "Miền Bắc"; // Default
};

/**
 * Tìm kiếm địa chỉ theo từ khóa
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Object} - Kết quả tìm kiếm
 */
const searchAddress = async (keyword) => {
    try {
        const provinces = await Province.find({
            $or: [
                { fullName: { $regex: keyword, $options: "i" } },
                { shortName: { $regex: keyword, $options: "i" } }
            ]
        }).limit(10);

        const wards = await Ward.find({
            $or: [
                { fullName: { $regex: keyword, $options: "i" } },
                { shortName: { $regex: keyword, $options: "i" } }
            ]
        }).populate('provinceCode', 'fullName').limit(20);

        return {
            provinces,
            wards,
            total: provinces.length + wards.length
        };
    } catch (error) {
        console.error("❌ Lỗi khi tìm kiếm địa chỉ:", error);
        throw error;
    }
};

module.exports = {
    importAddressData,
    searchAddress,
    extractShortName,
    getWardType,
    getRegionByProvince
};


