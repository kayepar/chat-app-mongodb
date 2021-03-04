const { getActiveRooms } = require('../common/common-fetch');
const { displayData } = require('../common/common-utils');

const displayAvailableRooms = async () => {
    const rooms = await getAvailableRooms();

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
};

const getAvailableRooms = async () => {
    try {
        return await getActiveRooms();
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

const getSelectedRoom = () => {
    if (!document.querySelector('#active-room-text')) return;

    const selected_item = document.querySelector('#active-room-text').textContent;

    if (selected_item === 'Join an active room') return;

    return selected_item;
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

const setActiveRoom = (name, selectedItem = undefined) => {
    clearActiveStyle();
    clearRoomInputBox();

    document.querySelector('#active-room-text').textContent = name;

    // coming from modal window
    if (!selectedItem) {
        const items = document.querySelectorAll('.dropdown-item');

        // find the room name from the dropdown
        selectedItem = Array.from(items).find((item) => item.text === name);
    }
    // add cyan background
    selectedItem.classList.add('active-room');
};

const clearActiveStyle = () => {
    const items = document.querySelectorAll('.dropdown-item');
    const activeItem = Array.from(items).find((item) => item.classList.contains('active-room'));

    if (activeItem) activeItem.classList.remove('active-room');
};

const clearRoomInputBox = () => {
    const room_text = document.querySelector('#room-text');
    room_text.value = '';
    room_text.removeAttribute('required');
};

const showDuplicateRoomModal = (room) => {
    $('#duplicate-room-modal').modal('show', {
        room: room,
    });
};

module.exports = {
    displayAvailableRooms,
    isRoomExisting,
    getSelectedRoom,
    cleanseFields,
    cleanseField,
    clearFeedbackMsgs,
    setActiveRoom,
    clearActiveStyle,
    showDuplicateRoomModal,
};
