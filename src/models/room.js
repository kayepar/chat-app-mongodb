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

roomSchema.methods.validateUser = function (email, username) {
    try {
        const results = this.validateUser2(email, username);
        console.log(results);
        // valid if both email and username are unique in room
        return this.users.some((user) => user.email === email) || this.users.some((user) => user.username === username)
            ? false
            : true;
    } catch (error) {
        throw new Error(error);
    }
};

roomSchema.methods.validateUser2 = function (email, username) {
    const user = { email, username };
    const duplicateFields = [];

    try {
        Object.keys(user).forEach((key) => {
            const duplicate = this.users.some((dbUser) => dbUser[key] === user[key]);
            if (duplicate) duplicateFields.push(key);
        });

        return {
            valid: duplicateFields.length > 0 ? false : true,
            duplicateFields,
        };
    } catch (error) {
        throw new Error(error);
    }
};

roomSchema.methods.deleteIfInactive = async function (event) {
    const isActive = await this.model('Room').isRoomStillActive(this, event);

    if (!isActive) return await this.deleteOne();
};

roomSchema.methods.getActiveUsers = async function () {
    try {
        const populatedRoom = await this.populate('users', 'username').execPopulate();

        return populatedRoom.users;
    } catch (error) {
        throw new Error(error);
    }
};

roomSchema.methods.getMessages = async function () {
    try {
        const populatedRoom = await this.populate('messages', 'text sender createdAt').execPopulate();

        return populatedRoom.messages;
    } catch (error) {
        throw new Error(error);
    }
};

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
        throw new Error(error);
    }
};

roomSchema.statics.getActiveRooms = function (callback) {
    try {
        this.find({})
            .populate('users')
            .exec((error, rooms) => {
                if (error) throw new Error(error);

                const activeRooms = rooms.reduce((filtered, room) => {
                    // room is active if it has online users
                    if (room.users.length > 0) {
                        filtered.push(room.name);
                    }

                    return filtered;
                }, []);

                callback(null, activeRooms);
            });
    } catch (error) {
        throw new Error(error);
    }
};

// used for housekeeping - DB cleanup upon server start or when a user leaves room
roomSchema.statics.isRoomStillActive = async function (room, event) {
    try {
        const myRoom = await room
            .populate({
                path: 'users',
                select: 'username',
            })
            .populate({
                path: 'messages',
            })
            .execPopulate();

        let isActive = myRoom.messages.length > 0;

        if (event === 'disconnect' && !isActive) {
            // check if there is another user in room
            // (apart from the one who just disconnected which represents users[0])
            isActive = myRoom.users.length > 1;
        }

        return isActive;
    } catch (error) {
        throw new Error(error);
    }
};

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
