const emailer = require('../email/emailer');

class CustomError extends Error {
    constructor(message, cause, status = 500, sendEmail = false) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.cause = cause;
        Error.captureStackTrace(this, this.constructor);

        // console.log(`customerror cause: ${this.cause}`);
        // console.log(`customerror stack: ${this.stack}`);
        if (sendEmail) {
            emailer.sendEmail(this);
        }
    }
}

module.exports = CustomError;
