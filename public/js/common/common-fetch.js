const isUsernameValid = async (username, room) => {
    // const response = await fetch(`/user/isUsernameValid?username=${username}&room=${room}`);

    // if (!response.ok) throw new Error(`An error has occured: ${response.status}`);

    // const { isValid } = await response.json();

    // return isValid;

    return true;
};

const getAllActiveRooms = async () => {
    // const response = await fetch('/room/getAllActiveRooms');

    // if (!response.ok) throw new Error(`An error has occured: ${response.status}`);

    // const { rooms } = await response.json();

    // return rooms;

    return [];
};

const getAllOtherActiveRooms = async (myRoom) => {
    // const response = await fetch(`/room/getAllOtherActiveRooms?room=${myRoom}`);

    // if (!response.ok) throw new Error(`An error has occured: ${response.status}`);

    // const { rooms } = await response.json();

    // return rooms;

    return [];
};

module.exports = {
    isUsernameValid,
    getAllActiveRooms,
    getAllOtherActiveRooms,
};
