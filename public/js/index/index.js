const { getAvailableRooms } = require('./index-utils');

$(document).ready(function () {
    // document.querySelector('#username-text').focus();
    document.querySelector('#email-text').focus();

    getAvailableRooms();
});
