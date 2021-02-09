const User = require('../models/user');
const Room = require('../models/room');

const cleanupDb = async () => {
    console.log('cleanup called');

    // delete users

    // get rooms and populate messages
    // loop through
    // if no message other than admin - delete room and messages
    // otherwise, leave room as is
    try {
        const rooms = await Room.find({});
        // console.log(rooms[0]);

        // rooms.forEach(async (room) => {
        //     // console.log(room);
        //     await Room.deleteIfInactive(room);
        // });

        await Promise.all(
            rooms.map(async (room) => {
                await Room.deleteIfInactive(room, 'cleanup');
            })
        );

        // !won't work if users are more than 1

        await User.deleteMany({});

        //     .exec()
        //     .then(async (room) => {
        //         console.log(room);
        //         const users = await room.execPopulate('users');
        //         console.log(users);
        //     });
    } catch (e) {
        console.log(e);
    }

    // console.log(rooms.users);
};

module.exports = {
    cleanupDb,
};
