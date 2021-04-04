const User = require('../models/user');
const Room = require('../models/room');
const Message = require('../models/message');

const logger = require('../utilities/logger');

// Utility that will delete all users and inactive rooms
// Called when server is started
const cleanupDb = async () => {
    try {
        if (process.env.NODE_ENV === 'test') return await resetDb();

        const rooms = await getRooms();

        await Promise.all(
            rooms.map(async (room) => {
                await room.deleteIfInactive('cleanup');
            })
        );

        await User.deleteMany({});
    } catch (error) {
        logger.error(error);
    }
};

const getRooms = async () => {
    return await Room.find({});
};

const resetDb = async () => {
    await Room.deleteMany();
    await User.deleteMany();
    await Message.deleteMany();
};

module.exports = {
    cleanupDb,
};
