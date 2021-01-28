const qs = require('qs');

const { username } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const { displayData, isMobile } = require('../common/common-utils');

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

const displayAsList = (list, type) => {
    let items = [];

    if (type === 'users') {
        list.forEach((item) => {
            const name = item.username === username ? `${item.username} (you)` : item.username;

            items.push(name);
        });
    } else {
        items = list;
    }

    // todo: delete! for testing purposes only
    // for (let i = 0; i < 7; i++) {
    //     items.push(`*${type.substring(0, type.length - 1)}-${i}`);
    // }

    if (items.length > 5) {
        const set1 = items.slice(0, 5);
        const set2 = items.slice(5, items.length);

        displayData({
            template: document.querySelector('#more-items-template'),
            parent_element: document.querySelector(`#${type}-section`),
            content: {
                set1,
                set2,
                type,
            },
        });
    } else {
        displayData({
            template: document.querySelector('#list-template'),
            parent_element: document.querySelector(`#${type}-section`),
            content: {
                items,
                type,
            },
        });
    }
};

const removeTypingIndicatorMsg = (username) => {
    if (document.querySelector(`#${username}-temp-msg-div`)) {
        document.querySelector(`#${username}-temp-msg-div`).remove();
    }
};

module.exports = {
    toggleCollapseLinkText,
    autoscroll,
    displayAsList,
    removeTypingIndicatorMsg,
};
