const getMonth = () => {
    const currentDate = new Date();

    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();

    const formattedDateTime = `${year}-${month}`;

    return formattedDateTime;
};

export default getMonth;
