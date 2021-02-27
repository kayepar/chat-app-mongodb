const winston = require('winston');
const { format } = require('logform');

let options = {
    console: {
        format: format.combine(
            format.simple(),
            format.colorize(),
            // format.metadata(),

            format.timestamp(),
            format.errors({ stack: true })

            // format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
        level: 'info',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
    file: {
        filename: `logs/app.log`,
        handleExceptions: true,
        maxsize: 5242880, // 5MB
        colorize: false,
    },
};

const loggerFormat = format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.metadata(),
    format.json()
);

const logger = winston.createLogger({
    // level: 'info',
    format: loggerFormat,
    transports: [new winston.transports.File(options.file), new winston.transports.Console(options.console)],
});

module.exports = logger;
