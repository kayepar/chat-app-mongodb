class CustomError extends Error {
    constructor(message, cause, status = 500, sendEmail = false) {
        super();

        this.name = this.constructor.name;
        this.status = status;
        this.message = message;
        this.cause = cause;

        Error.captureStackTrace(this, this.constructor);

        // removed sendEmail functionality for mocked CustomError
        if (sendEmail) {
            //     emailer.sendEmail(this);
        }
    }
}

module.exports = CustomError;
