const nodemailer = require('nodemailer');
const CustomError = require('../error/CustomError');

const transporter = nodemailer.createTransport({
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD,
    },
    secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});

const emailDetails = {
    from: process.env.EMAIL_ACCOUNT,
    to: process.env.EMAIL_ADMIN_ACCOUNT,
    subject: 'myChat: Critical Error encountered',
    text: 'test',
    html: '<h1>hi</h1>',
};

const sendEmail = () => {
    transporter.sendMail(emailDetails, (error, info) => {
        if (error) return new CustomError('Failed to send email', 500);

        return info.messageId;
    });
};

module.exports = {
    sendEmail,
};
