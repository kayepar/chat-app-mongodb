const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
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

// messageSchema.virtual('user', {
//     ref: 'User',
//     localField: 'sender',
//     foreignField: '_id',
// });

messageSchema.statics.generateMessage = function ({ sessionId, chatroom }, text) {
    text = text.trim();

    if (!text) {
        return;
    }

    return new this({ sender: sessionId, chatroom, text });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
