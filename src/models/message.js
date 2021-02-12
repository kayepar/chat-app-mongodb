const mongoose = require('mongoose');
const validator = require('validator');

const messageSchema = new mongoose.Schema(
    {
        sender: {
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
        },
        chatroom: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Room',
        },
        text: {
            type: String,
            trim: true,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.statics.dataCleanup = ({ sender, text, createdAt }) => {
    return {
        sender,
        text,
        createdAt,
    };
};

messageSchema.statics.generateMessage = async function ({ email, username, chatroom }, text) {
    text = text.trim();

    if (!text) {
        return;
    }
    const message = await this.create({ sender: { email, username }, chatroom, text });

    return this.dataCleanup(await message.execPopulate('sender', 'username email'));
};

// Notifications are not saved to DB
messageSchema.statics.generateNotification = (username, chatroom, text) => {
    const notif = {
        sender: { username },
        chatroom,
        text,
        createdAt: new Date().getTime(),
    };

    return notif;
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
