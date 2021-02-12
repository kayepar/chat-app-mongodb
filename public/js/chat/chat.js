const io = require('socket.io-client');
const qs = require('qs');
const moment = require('moment');

const { autoscroll, removeTypingIndicatorMsg } = require('./chat-utils');
const { getActiveRooms } = require('../common/common-fetch');
const { registerHbsHelper, displayData, displayAsList } = require('../common/common-utils');

$(document).ready(function () {
    registerHbsHelper();
    const socket = io();

    const { username, room, email } = qs.parse(location.search, {
        ignoreQueryPrefix: true,
    });

    const message_textbox = document.querySelector('#message-textbox');

    const initialize = async () => {
        message_textbox.focus();

        try {
            const allRooms = await getActiveRooms();
            const filteredRooms = allRooms.filter((activeRoom) => activeRoom !== room);
            displayAsList(filteredRooms, 'rooms');
        } catch (error) {
            console.log(`Error: ${error.message}`);
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

    socket.emit(
        'join',
        {
            email,
            username,
            room,
        },
        (error) => {
            // todo: handle other errors, probably customize message on modal window
            // todo: send email?
            if (error) {
                $('#duplicate-name-modal').modal('show');
            }
        }
    );

    socket.on('loadMessages', (messages) => {
        messages.forEach((message) => displayMessage(message));
    });

    socket.on('message', (message) => {
        removeTypingIndicatorMsg(message.sender.username);
        displayMessage(message);
    });

    // * Typing...
    document.querySelector('#message-textbox').addEventListener('keyup', (event) => {
        event.preventDefault();

        const message = message_textbox.value.trim();
        const typingIndicatorMsg = message.length > 0 ? '...' : 'idle';

        socket.emit('typing', typingIndicatorMsg, (error) => {
            if (error) {
                return error;
            }
        });
    });

    socket.on('typing', (message) => {
        if (message.text === 'idle') {
            return removeTypingIndicatorMsg(message.username);
        }

        message['type'] = 'received';
        message['createdAt'] = moment(message.createdAt).format('MM-D h:mm a');
        message['id'] = `${message.username}-temp-msg-div`;

        if (!document.querySelector(`#${message.id}`)) {
            // prevent duplicate notifs
            displayData({
                template: document.querySelector('#message-template'),
                parent_element: document.querySelector('#messages-div'),
                content: {
                    message,
                },
                position: 'beforeend',
            });
        }

        autoscroll();
    });

    socket.on('usersInRoomUpdate', ({ room, users }) => {
        displayData({
            template: document.querySelector('#room-name-template'),
            parent_element: document.querySelector('#current-room-section'),
            content: {
                room,
            },
        });

        displayAsList(users, 'users');
    });

    socket.on('activeRoomsUpdate', (rooms) => {
        // get a list of active rooms other than the user's current one
        const filteredRooms = rooms.allActiveRooms.filter((activeRoom) => activeRoom !== room);

        displayAsList(filteredRooms, 'rooms');
    });

    // * Send Message
    document.querySelector('#chat-message-form').addEventListener('submit', (event) => {
        event.preventDefault();

        const message = message_textbox.value.trim();
        message_textbox.focus();
        message_textbox.value = '';

        if (message.length < 1) {
            return;
        }

        socket.emit('sendMessage', message, (error) => {
            if (error) {
                return error;
            }
        });
    });

    initialize();
});
