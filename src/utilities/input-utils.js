const { check } = require('express-validator');

const preValidateInput = [
    check('username').trim().notEmpty().withMessage('Missing input').bail(),
    check('room').trim().notEmpty().withMessage('Missing input').bail(),
    check('email').trim().notEmpty().withMessage('Missing input').bail().isEmail().withMessage('Invalid email').bail(),
];

module.exports = {
    preValidateInput,
};
