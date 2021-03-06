const CustomError = require('../../../src/error/CustomError');

const validateUser = async (email, username, room) => {
    const response = await fetch(`/validateUser?email=${email}&username=${username}&room=${room}`);

    // todo: test this again!
    if (!response.ok) throw new CustomError(`An error has occured in validateUser route`, response.statusText, status);

    const { result } = await response.json();

    return result;
};

const getActiveRooms = async () => {
    const response = await fetch('/getActiveRooms');

    if (!response.ok)
        throw new CustomError(`An error has occured in getActiveRooms route`, response.statusText, status);

    const { rooms } = await response.json();

    return rooms;
};

module.exports = {
    validateUser,
    getActiveRooms,
};
