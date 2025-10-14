const Ward = require("../../model/address/Ward");

async function getWardOptionsByProvinceCode(provinceCode, { q, limit = 500 } = {}) {
    const filter = { provinceCode };
    if (q && q.trim()) {
        const rx = new RegExp(q.trim(), "i");
        filter.$or = [{ fullName: rx }, { shortName: rx }, { code: rx }];
    }

    const docs = await Ward
        .find(filter)
        .sort("fullName")
        .limit(Number(limit))
        .select("code shortName fullName type provinceCode districtCode -_id")
        .lean();

    return docs.map(w => ({
        value: w.code,
        label: w.shortName || w.fullName,
        meta: { type: w.type, provinceCode: w.provinceCode, districtCode: w.districtCode }
    }));
}

module.exports = { getWardOptionsByProvinceCode };
