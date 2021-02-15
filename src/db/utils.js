const User = require('../models/user');
const Room = require('../models/room');

// Utility that will delete all users and inactive rooms
// Called when server is started
const cleanupDb = async () => {
    try {
        const rooms = await Room.find({});

        await Promise.all(
            rooms.map(async (room) => {
                await room.deleteIfInactive('cleanup');
            })
        );

        await User.deleteMany({});
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    cleanupDb,
};
