const { displayAvailableRooms } = require('./index-utils');

$(document).ready(function () {
    // document.querySelector('#username-text').focus();
    document.querySelector('#email-text').focus();

    // document.querySelector('#email-text').value = 'kaye.cenizal@gmail.com';
    // document.querySelector('#username-text').value = 'kaye';
    // document.querySelector('#room-text').value = 'one';

    displayAvailableRooms();
});
