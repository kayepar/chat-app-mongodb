const {
    cleanseFields,
    cleanseField,
    clearActiveStyle,
    setActiveRoom,
    showDuplicateRoomModal,
    isRoomExisting,
} = require('./index-utils');

const { isUserValid } = require('../common/common-fetch');

const form = document.querySelector('#chat-form');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // trim and transform to lowercase
    cleanseFields();
    const username_feedback = document.querySelector('#username-feedback');
    username_feedback.style.display = 'none';

    // if form passed basic constraint checking
    if (form.checkValidity()) {
        const room = document.querySelector('#room-text').value;
        let room_qs = document.querySelector('#room-qs'); // will contain room value on submit
        const username = document.querySelector('#username-text').value;
        const email = document.querySelector('#email-text').value;

        // check if room name already exists
        if (isRoomExisting(room)) {
            e.preventDefault();
            showDuplicateRoomModal(room);
        } else {
            // set room query string - default value coming from room textbox
            room_qs.value = room;

            // but if an active room is selected...
            if (document.querySelector('#active-room-text')) {
                const selected_item = document.querySelector('#active-room-text').textContent;
                // set the "room" qs to that instead
                if (selected_item !== 'Join an active room') {
                    room_qs.value = selected_item;
                }
            }

            isUserValid(email, username, room_qs.value)
                .then((isValid) => {
                    isValid ? form.submit() : (username_feedback.style.display = 'block');
                })
                .catch((error) => console.log(`Error: ${error.message}`));
        }
    }
    form.classList.add('was-validated');
});

document.querySelector('#room-text').addEventListener('blur', function () {
    cleanseField(this);
    const room = this.value;

    if (isRoomExisting(room)) {
        showDuplicateRoomModal(room);
    }
});

document.querySelector('#username-text').addEventListener('keyup', (event) => {
    if (event.key !== 'Enter') {
        document.querySelector('#username-feedback').style.display = 'none';
    }
});

form.addEventListener('click', (e) => {
    // Note: implemented event delegation here since the active rooms dropdown is dynamically added to the DOM.
    // Can't assume that it's there all the time, thus, we cannot attach an event to its items.

    // active rooms dropdown
    if (e.target.className.includes('dropdown-item')) {
        clearActiveStyle();
        const selectedItem = e.target;

        if (selectedItem.id === 'clear') {
            document.querySelector('#active-room-text').textContent = 'Join an active room';
            document.querySelector('#room-text').setAttribute('required', 'required');
        } else {
            setActiveRoom(selectedItem.textContent, selectedItem);
        }
    }
});
