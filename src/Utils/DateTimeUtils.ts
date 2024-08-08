import moment from 'moment';

export function convertLiteralToDate(date: string): { startDate: moment.Moment, endDate: moment.Moment } {
    let startDate: moment.Moment;
    let endDate: moment.Moment;

    switch (date) {
        case 'Today':
            startDate = moment().startOf('day');
            endDate = moment().endOf('day');
            break;
        case 'Yesterday':
            startDate = moment().subtract(1, 'days').startOf('day');
            endDate = moment().subtract(1, 'days').endOf('day');
            break;
        case 'This Month':
            startDate = moment().startOf('month');
            endDate = moment().endOf('month');
            break;
        case 'Last Month':
            startDate = moment().subtract(1, 'month').startOf('month');
            endDate = moment().subtract(1, 'month').endOf('month');
            break;
        case 'This Quarter':
            startDate = moment().startOf('quarter');
            endDate = moment().endOf('quarter');
            break;
        case 'Last Quarter':
            startDate = moment().subtract(1, 'quarter').startOf('quarter');
            endDate = moment().subtract(1, 'quarter').endOf('quarter');
            break;
        case 'Last 6 Months':
            startDate = moment().subtract(6, 'months').startOf('month');
            endDate = moment().endOf('month');
            break;
        case 'This Year':
            startDate = moment().startOf('year');
            endDate = moment().endOf('year');
            break;
        default:
            throw new Error('Invalid date literal');
    }

    return { startDate, endDate };
}

export function getDateFromLiteral(value: string): Date {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = new Date(today);
    today.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    switch (value) {
        case 'last_12_months':
            startDate = new Date(today);
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        case 'last_30_days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 30);
            break;
        case 'last_6_months':
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 6);
            break;
        case 'last_60_days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 60);
            break;
        case 'last_90_days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 90);
            break;
        case 'last_month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'last_week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - today.getDay() - 7);
            endDate.setDate(today.getDate() - today.getDay() - 1);
            break;
        case 'this_month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'this_week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - today.getDay());
            endDate.setDate(today.getDate() + (6 - today.getDay()));
            break;
        case 'this_year':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            break;
        case 'today':
            return today;
        case 'yesterday':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 1);
            return startDate;
        case 'tomorrow':
            startDate = new Date(today);
            startDate.setDate(today.getDate() + 1);
            return startDate;
        default:
            throw new Error(`Unknown date literal: ${value}`);
    }

    return startDate;
}


export function getWaitUntilDate(daysToWait :number) :Date {
    const currentDate = new Date();
    const waitUntil = new Date(currentDate);
    waitUntil.setDate(currentDate.getDate() + daysToWait);
    return waitUntil;
}