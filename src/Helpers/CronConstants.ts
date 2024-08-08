export const cronSchedule = {
    EVERY_MINUTE : '* * * * *',
    DAILY_MIDNIGHT : '0 0 * * *',
    DAILY_3_AM : '0 3 * * *',
    EVERY_X_MINUTE : (min :number) => `*/${min} * * * *`
}