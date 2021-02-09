const mongoose = require('mongoose');
// const Message = require('./message');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
    },
});

// roomSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
//     const room = this;

//     // check if messages in room are all from admin or not
//     const hasMemberMessages = room.messages.some((message) => message.sender.username !== 'Admin');

//     // delete all if messages are just notifications from admin
//     hasMemberMessages ? next() : await Message.deleteMany({ chatroom: room._id });

//     next();
// });

roomSchema.statics.getActiveUsers = async (room) => {
    try {
        const populatedRoom = await room
            .populate({
                path: 'users',
                select: 'username',
                // match: { username: { $ne: 'Admin' } },
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

roomSchema.statics.deleteIfInactive = async function (room, activity) {
    try {
        const isActive = await this.isRoomActive(room, activity);

        if (!isActive) return await room.deleteOne();
    } catch (error) {
        console.log(error);
    }
};

roomSchema.statics.isRoomActive = async function (room, activity) {
    try {
        const myRoom = await room
            .populate({
                path: 'users',
                select: 'username',
            })
            .populate({
                path: 'messages',
                select: 'sender',
            })
            .execPopulate();

        console.log(myRoom.users);
        console.log(myRoom.messages);

        let isActive = myRoom.messages.length > 0;

        if (activity === 'disconnect' && !isActive) {
            // check if there is another user in room (apart from the one who just disconnected which represents users[0])
            isActive = myRoom.users.length > 1;
        }
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
