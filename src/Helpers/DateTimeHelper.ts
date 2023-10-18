export const isGreaterThan24Hours = (dateTime : Date | string) => {
    if (typeof dateTime === 'string') {
        dateTime = new Date(dateTime);
    }
    const currentDate = new Date();
    const difference = Math.abs(dateTime.getTime() - currentDate.getTime()); // Difference in milliseconds
    const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return difference > twentyFourHoursInMilliseconds;
}