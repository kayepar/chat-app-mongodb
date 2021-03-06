const mongoose = require('mongoose');
const CustomError = require('../error/CustomError');

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

roomSchema.methods.isUserAllowedToJoin = function (email, username) {
    if (!email || !username) throw new CustomError('Invalid request', 'Incomplete user details', 400);

    const user = { email, username };

    try {
        const duplicateFields = this.checkDuplicateCredentials(user);

        return {
            isAllowed: duplicateFields.length > 0 ? false : true,
            duplicateFields,
        };
    } catch (error) {
        throw new CustomError('Invalid request', 'Validation Error', 400);
    }
};

roomSchema.methods.checkDuplicateCredentials = function (user) {
    const duplicateFields = [];

    try {
        Object.keys(user).forEach((key) => {
            const duplicate = this.users.some((dbUser) => dbUser[key] === user[key]);
            if (duplicate) duplicateFields.push(key);
        });
    } catch (error) {
        throw new Error(error);
    }

    return duplicateFields;
};

roomSchema.methods.deleteIfInactive = async function (event) {
    const isActive = await this.isRoomStillActive(event);

    console.log(`${this.name} is active: ${isActive}`);

    if (!isActive) return await this.deleteOne();
};

// used for housekeeping - DB cleanup upon server start or when a user leaves room
roomSchema.methods.isRoomStillActive = async function (event) {
    try {
        const myRoom = await this.populate({
            path: 'users',
            select: 'username',
        })
            .populate({
                path: 'messages',
            })
            .execPopulate();

        const hasMessages = myRoom.messages.length > 0;
        const hasUsers = myRoom.users.length > 0;

        if (event === 'cleanup') return hasMessages;

        let isActive = hasUsers;

        if (!hasUsers) {
            if (hasMessages) isActive = true;
        }

        return isActive;
    } catch (error) {
        throw new Error(error);
    }
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
            if (error.code !== 11000) throw new Error(error);

            // if duplicate (code 11000), return existing
            return await Room.findOne({ name });
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
                if (error) callback(error);

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
