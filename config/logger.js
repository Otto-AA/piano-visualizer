const winston = require('winston');
const path = require('path');

const log_level = process.env.LOG_LEVEL;

// TODO: Check maximum sizes of logs
// TODO: Check how remote logging via heroku works

winston.loggers.add('requests', {
    level: log_level,
    format: winston.format.json(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log` 
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/combined.log'), level: 'info' }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/requests.log'), level: 'silly' })
    ]
});

winston.loggers.add('api', {
    level: log_level,
    format: winston.format.json(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log` 
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/combined.log'), level: 'info' }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/api.log'), level: 'silly' })
    ]
});

winston.loggers.add('app', {
    level: log_level,
    format: winston.format.json(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log` 
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/combined.log'), level: 'info' }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/app.log'), level: 'silly' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    const loggersToAddConsoleTransport = [
        winston.loggers.get('requests'),
        winston.loggers.get('api'),
        winston.loggers.get('app')
    ];
    loggersToAddConsoleTransport.forEach(logger => {
        logger.add(new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
            level: log_level
        }));
    });
}

module.exports = {
    app: winston.loggers.get('app'),
    api: winston.loggers.get('api'),
    requests: winston.loggers.get('requests')
};