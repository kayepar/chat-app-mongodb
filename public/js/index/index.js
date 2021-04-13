const { displayAvailableRooms } = require('./index-utils');

$(document).ready(function () {
    document.querySelector('#email-text').focus();

    displayAvailableRooms();
});
