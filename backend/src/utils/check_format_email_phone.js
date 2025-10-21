const isValidVietnamPhoneNumber = (phone) => {
    const regex = /^(?:\+84|84|0)(3[2-9]|8[1-5]|7(?:[6-9]|0))\d{1}([-.]?)\d{3}\2\d{3}$/;
    return regex.test(phone);
}

const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


module.exports = {
    isValidVietnamPhoneNumber,
    isValidEmail
}