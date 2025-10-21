const { listProvinceOptions, getProvinceByCode } = require("../../service/address/province.service");
const { getWardOptionsByProvinceCode } = require("../../service/address/ward.service");

const setCache = (res, seconds = 86400) => {
    res.set("Cache-Control", `public, max-age=${seconds}`);
};

exports.getProvinceOptions = async (req, res, next) => {
    try {
        const options = await listProvinceOptions(req.query);
        setCache(res);
        res.json({ success: true, options });
    } catch (e) { next(e); }
};

exports.getWardsByProvince = async (req, res, next) => {
    try {
        const { provinceCode } = req.params;
        const { q, limit } = req.query;

        const province = await getProvinceByCode(provinceCode);
        if (!province) {
            return res.status(404).json({ success: false, message: "Province not found" });
        }

        const options = await getWardOptionsByProvinceCode(provinceCode, { q, limit });
        setCache(res);
        res.json({ success: true, options, province: { code: province.code, name: province.shortName || province.fullName } });
    } catch (e) { next(e); }
};
