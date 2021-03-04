const { setActiveRoom } = require('./index-utils');

// used to pass in the name of the duplicate room
$('#duplicate-room-modal').on('show.bs.modal', function (e) {
    document.querySelector('#modal-duplicate-room').textContent = e.relatedTarget.room;
});

document.querySelector('#modal-yes-button').addEventListener('click', () => {
    overrideRoomName();
});

const overrideRoomName = () => {
    // get room value from room textbox
    setActiveRoom(document.querySelector('#room-text').value);

    $('#duplicate-room-modal').modal('hide');
    document.querySelector('#start-button').focus();
};

document.querySelectorAll('#modal-no-button, #modal-x-button').forEach((button) => {
    button.addEventListener('click', () => {
        closeModalWindow();
    });
});

const closeModalWindow = () => {
    $('#duplicate-room-modal').modal('hide');
    const room_text = document.querySelector('#room-text');
    const room_text_length = room_text.value.length;

    room_text.focus();
    room_text.setSelectionRange(room_text_length, room_text_length);
};

// on modal - respond to enter key, y or n
$('#duplicate-room-modal').on('keydown', function (e) {
    e.preventDefault();

    const key = e.key.toLowerCase();

    if (key === 'enter' || key === 'y') {
        overrideRoomName();
    } else if (key === 'n') {
        closeModalWindow();
    }
});
