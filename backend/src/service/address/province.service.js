const Province = require("../../model/address/Province");

async function listProvinceOptions({ q, region, sort = "fullName" }) {
    const filter = {};
    if (q && q.trim()) {
        const rx = new RegExp(q.trim(), "i");
        filter.$or = [{ fullName: rx }, { shortName: rx }, { code: rx }];
    }
    if (region) filter.region = region;

    const docs = await Province
        .find(filter)
        .sort(sort)
        .select("code shortName fullName type region -_id")
        .lean();

    return docs.map(p => ({
        value: p.code,
        label: p.shortName || p.fullName,
        meta: { fullName: p.fullName, type: p.type, region: p.region }
    }));
}

async function getProvinceByCode(code) {
    return Province.findOne({ code }).lean();
}

module.exports = { listProvinceOptions, getProvinceByCode };
