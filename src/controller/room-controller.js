const Room = require('../models/room');
const CustomError = require('../error/CustomError');

const validateUser = async (req, res, next) => {
    try {
        const { email, username, room } = req.query;

        if (!email || !username || !room) {
            throw new CustomError('Invalid request', 'Incomplete user details', 400);
        }

        const chatRoom = await getChatRoom(room);

        // if room is not existing, credentials are automatically valid since there are
        // no users yet
        const result = chatRoom
            ? chatRoom.isUserAllowedToJoin(email, username)
            : { isAllowed: true, duplicateFields: [] };

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
    return await Room.findOne({ name: room });
};

const getActiveRooms = async (req, res, next) => {
    try {
        const rooms = await Room.getActiveRooms();

        res.status(200).send({ rooms });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    validateUser,
    getActiveRooms,
};
