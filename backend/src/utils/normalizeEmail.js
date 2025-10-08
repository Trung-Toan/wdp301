function normalizeEmail(raw) {
    if (!raw) return '';
    const e = String(raw).trim().toLowerCase();
    const [local, domain] = e.split('@');
    if (!domain) return e;

    if (domain === 'gmail.com' || domain === 'googlemail.com') {
        const noPlus = local.split('+')[0];
        const noDots = noPlus.replace(/\./g, '');
        return `${noDots}@gmail.com`;
    }
    return `${local}@${domain}`;
}

module.exports = { normalizeEmail };
