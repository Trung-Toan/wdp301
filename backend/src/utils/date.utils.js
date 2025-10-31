/**
 * chuyển date từ String -> Date và gắn giờ hiện tại vào ngày đó
 * 
 * @param {*} date date String  
 * @returns 
 */
exports.changeToDateWithNowHouse = (date = new Date()) => {
    date = new Date(date);
    const now = new Date();
    let dateFilter = new Date(date);
    dateFilter.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
    );
    return dateFilter;
}