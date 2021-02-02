const mongoose = require('mongoose');
const validator = require('validator');
// const Room = require('./Room');

const userSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.');
            }
        },
    },
    username: {
        type: String,
        required: true,
        trim: true,
        lowecase: true,
    },
    chatroom: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Room',
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
