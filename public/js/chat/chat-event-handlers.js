const qs = require('qs');
const { toggleCollapseLinkText } = require('./chat-utils');
const { isMobile } = require('../common/common-utils');

const { email, username } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

// users/rooms collapse component - displayed
$(document).on('show.bs.collapse', '#users-set2-div, #rooms-set2-div', function (e) {
    const list_set2_div = e.target;
    const collapse_link_div = list_set2_div.previousElementSibling;

    toggleCollapseLinkText(collapse_link_div);

    list_set2_div.insertAdjacentHTML('afterend', collapse_link_div.outerHTML);
    collapse_link_div.remove();
});

// users/rooms collapse component - hidden
$(document).on('hidden.bs.collapse', '#users-set2-div, #rooms-set2-div', function (e) {
    const list_set2_div = e.target;
    const list_set1_div = e.target.previousElementSibling;
    const collapse_link_div = list_set2_div.nextElementSibling;

    toggleCollapseLinkText(collapse_link_div);

    list_set1_div.insertAdjacentHTML('afterend', collapse_link_div.outerHTML);
    collapse_link_div.remove();
});

$('#sidebarCollapse').on('click', function () {
    $('#sidebar-menu').toggleClass('active');
    $('.overlay').addClass('active');
});

$('#sidebar-toggler-2').on('click', function () {
    $('#sidebar-menu').toggleClass('active');
    $('.overlay').addClass('active');
});

$('#sidebar-toggler-1, .overlay').on('click', function () {
    $('#sidebar-menu').removeClass('active');
    $('.overlay').removeClass('active');
});

document.querySelector('#sidebar-content').addEventListener('click', (e) => {
    e.preventDefault();
    // join another room
    if (e.target.id.startsWith('rooms-')) {
        if (!localStorage.getItem('join-room-modal-checked')) {
            // show modal
            // save selected room to a hidden element
            document.querySelector('#chosen-room').value = e.target.text;
            $('#join-room-modal').modal('show');
        } else {
            window.open(`/chat.html?room=${e.target.text}&email=${email}&username=${username}`, '_blank');
        }
    }
});

// submit message on enter
document.querySelector('#message-textbox').addEventListener('textInput', function (e) {
    if (e.data.includes('\n')) {
        e.preventDefault();
        document.querySelector('#chat-message-form').dispatchEvent(new Event('submit'));
    }
});

const originalDimension = window.innerHeight + window.innerWidth;
const messagesDiv = document.querySelector('#messages-div');

window.addEventListener('resize', () => {
    if (isMobile()) {
        // message input box
        if (document.activeElement.tagName === 'INPUT') {
            const sizeDiff = Math.abs(originalDimension - (window.innerHeight + window.innerWidth));

            if (sizeDiff > 100) {
                // keyboard is active
                messagesDiv.classList.add('with-keyboard');

                // get saved scroll value and set it again
                const savedScrollValue = localStorage.getItem('messages-scroll');
                messagesDiv.scrollTop = parseInt(savedScrollValue);
            } else {
                // sizeDiff === 0 if keyboard is closed using the back button. Remove class to return to
                // full height
                messagesDiv.classList.remove('with-keyboard');
            }
        } else {
            // if you click anywhere outside the message input box, keyboard would close. Return to full
            // height
            messagesDiv.classList.remove('with-keyboard');
        }
    }
});
