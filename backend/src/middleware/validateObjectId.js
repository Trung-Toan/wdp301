const { Types } = require("mongoose");

module.exports = (paramName) => (req, res, next) => {
    const val = req.params[paramName];
    if (!Types.ObjectId.isValid(val)) {
        return res.status(400).json({
            success: false,
            error: `Invalid ${paramName} ObjectId (expect 24 hex).`,
        });
    }
    next();
};
