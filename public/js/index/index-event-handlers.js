const {
    cleanseFields,
    cleanseField,
    clearFeedbackMsgs,
    clearActiveStyle,
    setActiveRoom,
    showDuplicateRoomModal,
    isRoomExisting,
    getSelectedRoom,
} = require('./index-utils');

const { validateUser } = require('../common/common-fetch');

const form = document.querySelector('#chat-form');

form.addEventListener('submit', async (e) => {
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

        if (isRoomExisting(room)) {
            e.preventDefault();
            showDuplicateRoomModal(room);
        } else {
            // set room query string - get from dropdown list or from room textbox (default)
            room_qs.value = getSelectedRoom() || room;

            try {
                const user = await validateUser(email, username, room_qs.value);

                if (user.isAllowed) {
                    form.submit();
                } else {
                    user.duplicateFields.forEach((field) => {
                        const feedbackField = document.querySelector(`#${field}-feedback`);
                        feedbackField.style.display = 'block';
                    });
                }
            } catch (error) {
                console.log(`Error: ${error}`);
                window.location.href = '500.html';
            }
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

    // active rooms dropdown - changed selected item
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
