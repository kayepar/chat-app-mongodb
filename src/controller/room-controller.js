const Room = require('../models/room');
const CustomError = require('../error/CustomError');

const validateUser = async (req, res, next) => {
    try {
        const { email, username, room } = req.query;

        if (!email || !username || !room) {
            throw new CustomError('Invalid request', 'Incomplete user details', 400);
        }

        const chatRoom = await lib.getChatRoom(room);

        console.log(chatRoom);

        const result = chatRoom
            ? lib.checkUserAccess(chatRoom, email, username)
            : { isAllowed: true, duplicateFields: [] };

        console.log(result);

        res.status(200).send({
            result,
        });
    } catch (error) {
        if (!(error instanceof CustomError)) {
            return next(new CustomError('Something went wrong', error.stack, 500, true));
        }

        return next(error);
    }
};

const getChatRoom = async (room) => {
    console.log('getChatroom original function');
    return await Room.findOne({ name: room });
};

const checkUserAccess = (room, email, username) => {
    return room.isUserAllowedToJoin(email, username);
};

const getActiveRooms = async (req, res, next) => {
    try {
        const rooms = await Room.getActiveRooms();

        res.status(200).send({ rooms });
    } catch (error) {
        return next(error);
    }
};

// ! note1: needed to combine all functions into an object for easier mocking with spyOn
// ! note2: to call functions from within this module, use lib object (i.e. lib.getChatRoom())
const lib = {
    validateUser,
    getChatRoom,
    getActiveRooms,
    checkUserAccess,
};

module.exports = lib;
