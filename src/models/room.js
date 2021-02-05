const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
    },
});

// roomSchema.statics.findByName = async (roomName) => {
//     const room = await Room.findOne({ name: roomName });

//     // if (!room) return null;

//     return room;
// };

// used to create virtual properties --> not saved in Db
roomSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'chatroom',
});

roomSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'chatroom',
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
