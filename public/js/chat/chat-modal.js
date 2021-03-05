const qs = require('qs');

const { email, username } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

// modal for joining another room from the sidebar
document.querySelector('#join-room-modal-yes-button').addEventListener('click', (e) => {
    e.preventDefault();
    // get selected room from hidden element
    const chosenRoom = document.querySelector('#chosen-room').value;

    window.open(`/chat.html?room=${chosenRoom}&email=${email}&username=${username}`, '_blank');

    $('#join-room-modal').modal('hide');
});

document.querySelector('#join-room-modal-label-no-show').addEventListener('click', () => {
    const checkbox = document.querySelector('#join-room-modal-checkbox-no-show');

    checkbox.checked ? (checkbox.checked = false) : (checkbox.checked = true);
    checkbox.dispatchEvent(new Event('change'));
});

document.querySelector('#join-room-modal-checkbox-no-show').addEventListener('change', (e) => {
    e.stopPropagation();

    if (e.currentTarget.checked) {
        localStorage.setItem('join-room-modal-checked', true);
    } else {
        localStorage.removeItem('join-room-modal-checked');
    }
});

document.querySelector('#exit-room-button').addEventListener('click', () => {
    $('#exit-room-modal').modal('show');
});
