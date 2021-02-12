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

roomSchema.pre('findOne', { document: false, query: true }, function (next) {
    this.populate('users');

    next();
});

// triggered by create()
roomSchema.pre('save', { document: true, query: false }, function (next) {
    this.execPopulate('users');

    next();
});

roomSchema.methods.validateUser = async function (email, username) {
    try {
        return this.users.some((user) => user.email === email) || this.users.some((user) => user.username === username)
            ? false
            : true;
    } catch (error) {
        console.log(error);
    }
};

roomSchema.methods.deleteIfInactive = async function (activity) {
    const isActive = await this.model('Room').isRoomActive(this, activity);

    if (!isActive) return await this.deleteOne();
};

roomSchema.methods.getActiveUsers = async function () {
    try {
        // todo: change to shorthand
        const populatedRoom = await this.populate({
            path: 'users',
            select: 'username',
        }).execPopulate();

        return populatedRoom.users;
    } catch (error) {
        console.log(error);
    }
};

roomSchema.methods.getMessages = async function () {
    try {
        // const populatedRoom = await this.populate('messages', 'text sender createdAt').execPopulate();
        const populatedRoom = await this.populate({
            path: 'messages',
            select: 'text sender createdAt',
            populate: { path: 'sender' },
        }).execPopulate();

        return populatedRoom.messages;
    } catch (error) {
        console.log(error);
    }
};

// todo: handle errors properly
roomSchema.statics.createRoom = async function (name) {
    try {
        return await this.create({ name }).then(null, async (error) => {
            if (error.code === 11000) {
                // if duplicate, return existing
                return await Room.findOne({ name });
            } else {
                throw new Error(error);
            }
        });
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
                    if (room.users.length > 0) {
                        filtered.push(room.name);
                        // filtered.push(room);
                    }

                    return filtered;
                }, []);

                callback(null, activeRooms);
            });
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

        // console.log(myRoom.users);
        // console.log(myRoom.messages);

        let isActive = myRoom.messages.length > 0;

        if (activity === 'disconnect' && !isActive) {
            // check if there is another user in room
            // (apart from the one who just disconnected which represents users[0])
            isActive = myRoom.users.length > 1;
        }
        // console.log(`${room.name} is active: ${isActive}`);

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
