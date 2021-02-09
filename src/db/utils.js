const User = require('../models/user');
const Room = require('../models/room');

const cleanupDb = async () => {
    console.log('cleanup called');

    try {
        const rooms = await Room.find({});
        await Promise.all(
            rooms.map(async (room) => {
                await Room.deleteIfInactive(room, 'cleanup');
            })
        );
        await User.deleteMany({});
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    cleanupDb,
};
