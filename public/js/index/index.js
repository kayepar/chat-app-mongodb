const { getAvailableRooms } = require('./index-utils');

$(document).ready(function () {
    document.querySelector('#username-text').focus();
    getAvailableRooms();
});
