const winston = require('winston');
const { format } = require('logform');

let options = {
    console: {
        format: format.combine(
            format.colorize(),
            format.metadata(),
            format.timestamp(),
            format.prettyPrint(),
            format.printf(({ level, message, timestamp, metadata }) => {
                // eslint-disable-next-line no-prototype-builtins
                if (metadata.metadata.hasOwnProperty('stack')) {
                    return `${timestamp} ${level}: ${message} - ${metadata.metadata.status} ${metadata.metadata.cause} - ${metadata.metadata.stack}`;
                }

                return `${timestamp} ${level}: ${message}`;
            })
        ),
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
    level: 'info',
    format: loggerFormat,
    transports: [new winston.transports.File(options.file), new winston.transports.Console(options.console)],
});

// will be used by morgan
logger.stream = {
    // eslint-disable-next-line no-unused-vars
    write: function (message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

module.exports = logger;
