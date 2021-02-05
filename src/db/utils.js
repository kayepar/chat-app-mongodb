const User = require('../models/user');
const Room = require('../models/room');
const Message = require('../models/message');

const cleanupDb = async () => {
    console.log('cleanup called');

    // delete users

    // get rooms and populate messages
    // loop through
    // if no message other than admin - delete room and messages
    // otherwise, leave room as is
    try {
        await User.deleteMany({});

        await Message.deleteMany({});
        const rooms = await Room.find({});

        // console.log(rooms[0]);

        rooms.forEach(async (room) => {
            // console.log(room);
            const users = await room.execPopulate('users');
            // console.log(users.users);
        });

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
