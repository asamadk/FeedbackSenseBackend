import * as moment from 'moment-timezone';
import 'moment-timezone';

export const isGreaterThan24Hours = (dateTime : Date | string) => {
    if (typeof dateTime === 'string') {
        dateTime = new Date(dateTime);
    }
    const currentDate = new Date();
    const difference = Math.abs(dateTime.getTime() - currentDate.getTime()); // Difference in milliseconds
    const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return difference > twentyFourHoursInMilliseconds;
}

export const getTwelveMonthAgoDate = () => {
    const today = new Date();
    const twelveMonthAgo = new Date(today);
    twelveMonthAgo.setDate(today.getDate() - 365);
    return twelveMonthAgo.toLocaleDateString('en-US');
}

export const getTodaysDate = () => {
    return new Date().toLocaleDateString('en-US');
}

export const getDateFromDuration = (duration : string,type : 'start' | 'end') => {
    if(type === 'start'){
        return moment.tz(duration, 'MM/DD/YYYY', 'UTC').startOf('day').toDate();
    }else{
        return moment.tz(duration, 'MM/DD/YYYY', 'UTC').endOf('day').toDate();
    }
}