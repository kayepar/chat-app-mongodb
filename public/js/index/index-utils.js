const { getActiveRooms } = require('../common/common-fetch');
const { displayData } = require('../common/common-utils');

const getAvailableRooms = async () => {
    try {
        const rooms = await getActiveRooms();

        if (rooms.length > 0) {
            displayData({
                template: document.querySelector('#active-rooms-template'),
                parent_element: document.querySelector('#room-div'),
                content: {
                    rooms,
                },
                position: 'afterend',
            });
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
};

const isRoomExisting = (room) => {
    const items = document.querySelectorAll('.dropdown-item');
    const rooms = [];

    // get the room names from dropdown and add to array
    items.forEach((item) => rooms.push(item.text));

    return rooms.includes(room);
};

const cleanseFields = () => {
    const input_fields = document.querySelectorAll('input[type=text]');

    input_fields.forEach((field) => cleanseField(field));
};

const cleanseField = (field) => {
    const value = field.value.trim().toLowerCase();

    field.value = value;
};

const clearFeedbackMsgs = () => {
    const fields = ['email', 'username'];

    fields.forEach((field) => {
        document.querySelector(`#${field}-feedback`).style.display = 'none';
    });
};

const clearActiveStyle = () => {
    const items = document.querySelectorAll('.dropdown-item');

    items.forEach((item) => item.classList.remove('active-room'));
};

const setActiveRoom = (name, selectedItem) => {
    clearActiveStyle();

    document.querySelector('#active-room-text').textContent = name;

    const room_text = document.querySelector('#room-text');
    room_text.value = '';
    room_text.removeAttribute('required');

    // add cyan background
    if (selectedItem) {
        selectedItem.classList.add('active-room');
    } else {
        // with confirmation coming from modal window
        const items = document.querySelectorAll('.dropdown-item');

        // find the room name from the dropdown
        items.forEach((item) => {
            if (item.text === name) {
                item.classList.add('active-room');
            }
        });
    }
};

const showDuplicateRoomModal = (room) => {
    $('#duplicate-room-modal').modal('show', {
        room: room,
    });
};

module.exports = {
    getAvailableRooms,
    isRoomExisting,
    cleanseFields,
    cleanseField,
    clearFeedbackMsgs,
    clearActiveStyle,
    setActiveRoom,
    showDuplicateRoomModal,
};
