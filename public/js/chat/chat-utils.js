const qs = require('qs');
const moment = require('moment');

const { email } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const { isMobile, displayData } = require('../common/common-utils');

const messages = document.querySelector('#messages-div');

const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    // Visible height (only what you can see)
    const visibleHeight = messages.offsetHeight;

    // Height of the messages container (including messages that got cut off)
    const containerHeight = messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }

    if (isMobile) {
        localStorage.setItem('messages-scroll', messages.scrollTop);
    }
};

const toggleCollapseLinkText = (parentElement) => {
    const icon_span = parentElement.querySelectorAll('span')[0];
    const link_text = parentElement.querySelectorAll('span')[1];

    if (link_text.textContent === 'Show less') {
        link_text.textContent = 'Show more';
        icon_span.innerHTML = '<i class="fas fa-angle-down"></i>';
    } else {
        link_text.textContent = 'Show less';
        icon_span.innerHTML = '<i class="fas fa-angle-up"></i>';
    }
};

const displayMessage = (message) => {
    const rawTimestamp = message.createdAt;
    const type = message.sender.email === email ? 'sent' : 'received';

    message['type'] = type;
    message['createdAt'] = moment(message.createdAt).format('MM-D h:mm a');
    message['id'] = `${message.sender.username}-${rawTimestamp}-msg-div`;

    displayData({
        template: document.querySelector('#message-template'),
        parent_element: document.querySelector('#messages-div'),
        content: {
            message,
        },
        position: 'beforeend',
    });

    autoscroll();
};

const removeTypingIndicatorMsg = (username) => {
    if (document.querySelector(`#${username}-temp-msg-div`)) {
        document.querySelector(`#${username}-temp-msg-div`).remove();
    }
};

module.exports = {
    toggleCollapseLinkText,
    autoscroll,
    displayMessage,
    removeTypingIndicatorMsg,
};
