const mongoose = require('mongoose');
const Message = require('./message');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
    },
});

roomSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    console.log('delete one middleware called');
    const room = this;
    const hasMemberMessages = room.messages.some((message) => message.sender.username !== 'Admin');

    hasMemberMessages ? next() : await Message.deleteMany({ chatroom: room._id });

    next();
});

roomSchema.statics.getActiveUsers = async (room) => {
    try {
        const populatedRoom = await room
            .populate({
                path: 'users',
                select: 'username',
                match: { username: { $ne: 'Admin' } },
            })
            .execPopulate();

        return populatedRoom.users;
    } catch (error) {
        console.log(error);
    }
};

roomSchema.statics.getActiveRooms = function (callback) {
    try {
        this.find({})
            .populate('users')
            .exec((error, rooms) => {
                if (error) throw new Error(error);

                const activeRooms = rooms.reduce((filtered, room) => {
                    if (room.users.length > 1) {
                        // room has user other than admin
                        filtered.push(room.name);
                    }

                    return filtered;
                }, []);

                callback(null, activeRooms);
            });
    } catch (error) {
        console.log(error);
    }
};

roomSchema.statics.deleteIfInactive = async function (room) {
    try {
        const isActive = await this.isRoomActive(room);

        if (!isActive) await room.deleteOne();
    } catch (error) {
        console.log(error);
    }
};

roomSchema.statics.isRoomActive = async function (room) {
    try {
        const myRoom = await room
            .populate({
                path: 'users',
                select: 'username',
                match: { username: { $ne: 'Admin' } },
            })
            .populate({
                path: 'messages',
                select: 'sender',
                populate: {
                    path: 'sender',
                    select: 'username',
                },
            })
            .execPopulate();

        // console.log(myRoom.users);
        // console.log(myRoom.messages);

        let isActive = false;

        // keep room if there is another user other than Admin
        // or there are messages other than notifications (from Admin)
        if (myRoom.users > 1 || myRoom.messages.some((message) => message.sender.username !== 'Admin')) isActive = true;

        console.log(`${room.name} is active: ${isActive}`);

        return isActive;
    } catch (error) {
        console.log(error);
    }
};

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
