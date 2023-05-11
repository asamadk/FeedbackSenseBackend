import { createLogger, format, transports } from "winston";

const logFilePath = 'logs/server.log';
const errorFilePath = 'logs/error.log';
const maxFileSize = 10 * 1024 * 1024; // 10MB
const maxFiles = 50; // Number of rotated log files to retain

export const logger = createLogger({
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                format.align(),
                format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`)
            )
        }),
        new transports.File({
            filename: logFilePath,
            format: format.combine(
                format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                format.align(),
                format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            ),
            maxsize: maxFileSize,
            maxFiles: maxFiles,
            tailable: true,
            zippedArchive: true,
        }),
        new transports.File({
            level: 'error',
            filename: errorFilePath,
            format: format.combine(
                format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                format.align(),
                format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            ),
            maxsize: maxFileSize,
            maxFiles: maxFiles,
            tailable: true,
            zippedArchive: true,
        })
    ]
})