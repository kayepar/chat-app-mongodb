const mongoose = require('mongoose');
const validator = require('validator');

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

userSchema.pre('findOne', { document: false, query: true }, function (next) {
    this.populate('chatroom', 'name');

    next();
});

userSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'sender',
});

const User = mongoose.model('User', userSchema);

module.exports = User;
