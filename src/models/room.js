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

roomSchema.statics.getActiveRooms = async function (callback) {
    try {
        this.find({})
            .populate('users')
            .exec(function (error, rooms) {
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
