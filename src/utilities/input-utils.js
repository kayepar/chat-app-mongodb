// const sanitize = ({ email, username, room }) => {};

const { check } = require('express-validator');

// const validateEmail = () => {
//     [check('email').isEmail()];
// };

module.exports = {
    validateEmail: [check('email').isEmail()],
};
