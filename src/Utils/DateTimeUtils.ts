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