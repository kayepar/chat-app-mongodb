const { check } = require('express-validator');

const preSanitizeAndValidate = [
    check('username').trim().not().isEmpty().withMessage('Missing input').bail(),
    check('room').trim().not().isEmpty().withMessage('Missing input').bail(),
    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Missing input')
        .bail()
        .isEmail()
        .withMessage('Invalid email')
        .bail(),
];

module.exports = {
    preSanitizeAndValidate,
};
