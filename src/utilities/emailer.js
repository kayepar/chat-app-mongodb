const nodemailer = require('nodemailer');
const CustomError = require('../error/CustomError');

const transporter = nodemailer.createTransport({
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD,
    },
    secure: true,
});

const sendEmail = ({ cause, stack }) => {
    const emailDetails = {
        from: process.env.EMAIL_ACCOUNT,
        to: process.env.EMAIL_ADMIN_ACCOUNT,
        subject: 'myChat: Critical Error encountered',
        text: `Please check below error: \n\n Cause: \n ${cause} \n\n Custom Stack: \n ${stack}`,
    };

    // console.log(`stack from emailer: ${stack}`);
    transporter.sendMail(emailDetails, (error, info) => {
        if (error) return new CustomError('Failed to send email', error.stack, 500);

        return info.messageId;
    });
};

module.exports = {
    sendEmail,
};
