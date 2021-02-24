const {
    cleanseFields,
    cleanseField,
    clearFeedbackMsgs,
    clearActiveStyle,
    setActiveRoom,
    showDuplicateRoomModal,
    isRoomExisting,
} = require('./index-utils');

const { validateUser } = require('../common/common-fetch');

const form = document.querySelector('#chat-form');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // trim and transform to lowercase
    cleanseFields();
    clearFeedbackMsgs();

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

            validateUser(email, username, room_qs.value)
                .then((result) => {
                    if (result.valid) {
                        form.submit();
                    } else {
                        result.duplicateFields.forEach((field) => {
                            const feedbackField = document.querySelector(`#${field}-feedback`);
                            feedbackField.style.display = 'block';
                        });
                    }
                })
                .catch((error) => {
                    console.log(`Error: ${error.message}`);
                    // todo: send email?
                    window.location.href = '500.html';
                });
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

document.querySelector('#email-text').addEventListener('keyup', (event) => {
    if (event.key !== 'Enter') {
        document.querySelector('#email-feedback').style.display = 'none';
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
