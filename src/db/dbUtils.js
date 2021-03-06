const User = require('../models/user');
const Room = require('../models/room');
const logger = require('../utilities/logger');

// Utility that will delete all users and inactive rooms
// Called when server is started
const cleanupDb = async () => {
    try {
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

module.exports = {
    cleanupDb,
};
