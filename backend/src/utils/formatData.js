exports.formatData = (data) => {
    if (!data || typeof data !== "object") {
        return null;
    }

    const { _id, ...rest } = data._doc || data; // hỗ trợ cả Mongoose document
    return {
        id: _id,
        ...rest
    };
};
