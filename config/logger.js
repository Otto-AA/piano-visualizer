const winston = require('winston');
const path = require('path');

const log_level = process.env.LOG_LEVEL;

// TODO: Check maximum sizes of logs
// TODO: Check how remote logging via heroku works
// TODO: Make 

const loggerNames = [
    'requestsLogger',
    'apiLogger',
    'appLogger',
    'databaseLogger'
];

const loggers = {};

loggerNames.forEach(loggerName => {
    loggers[loggerName] = winston.createLogger({
        level: log_level,
        format: winston.format.json(),
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })
        ]
    });
});

module.exports = loggers;