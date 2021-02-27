const Filter = require('bad-words');

const User = require('./models/user');
const Room = require('./models/room');
const Message = require('./models/message');

const CustomError = require('./error/CustomError');
// test todos:
// todo: change focus on e2e test - should be email
// todo: feedback error messages for email
// todo: fixtures in unit tests
// todo: re-login to show saved messages

// todo: add logger - winston
// todo: add emailer

const chatSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('join', async ({ email, username, room }, callback) => {
            try {
                const chatRoom = await Room.createRoom(room);
                const result = chatRoom.validateUser(email, username);

                if (!result.valid) return callback('Username/Email Address already in use.');

                const user = await User.create({
                    sessionId: socket.id,
                    email,
                    username,
                    chatroom: chatRoom._id,
                });
                console.log(`${user.username} joined`);

                socket.join(room);

                socket.emit('loadMessages', await chatRoom.getMessages());

                socket.emit('message', Message.generateNotification('Admin', room, `Welcome, ${username}!`));
                socket.broadcast
                    .to(room)
                    .emit('message', Message.generateNotification('Admin', room, `${user.username} has joined!`));

                io.to(room).emit('usersInRoomUpdate', {
                    room,
                    users: await chatRoom.getActiveUsers(),
                    // note: this will re-populate the users object to get the updated list
                });

                Room.getActiveRooms((error, rooms) => {
                    if (error) throw new Error(error);

                    socket.broadcast.emit('activeRoomsUpdate', {
                        allActiveRooms: rooms,
                    });
                });

                callback();
            } catch (error) {
                // todo: fix error message - always saying duplicates (modal)
                console.log('try catch');
                console.log(error);

                new CustomError(`Socket 'join' error`, error.stack, 500, true);
            }
        });

        socket.on('sendMessage', async (message, callback) => {
            const filter = new Filter();

            if (filter.isProfane(message)) {
                return callback('Profanity is not allowed!');
            }

            try {
                const user = await User.findOne({ sessionId: socket.id });
                io.to(user.chatroom.name).emit('message', await Message.generateMessage(user, message));

                callback();
            } catch (error) {
                console.log(error);
                new CustomError(`Socket 'sendMessage' error`, error.stack, 500, true);
            }
        });

        socket.on('typing', async (message, callback) => {
            try {
                const user = await User.findOne({ sessionId: socket.id });

                if (user) {
                    socket.broadcast
                        .to(user.chatroom.name)
                        .emit('typing', Message.generateNotification(user.username, user.chatroom.name, message));
                }
                callback();
            } catch (error) {
                console.log(error);
                new CustomError(`Socket 'typing' error`, error.stack, 500, true);
            }
        });

        socket.on('disconnect', async () => {
            try {
                const user = await User.findOne({ sessionId: socket.id });

                if (user) {
                    console.log(`${user.username} disconnected`);
                    await user.deleteOne();

                    const room = user.chatroom;
                    await room.deleteIfInactive('disconnect');

                    Room.getActiveRooms((error, rooms) => {
                        if (error) throw new Error(error);

                        socket.broadcast.emit('activeRoomsUpdate', {
                            allActiveRooms: rooms,
                        });
                    });

                    io.to(room.name).emit(
                        'message',
                        Message.generateNotification('Admin', room.name, `${user.username} has left!`)
                    );

                    io.to(room.name).emit('usersInRoomUpdate', {
                        room: room.name,
                        users: await room.getActiveUsers(),
                    });
                }
            } catch (error) {
                console.log(error);
                new CustomError(`Socket 'disconnect' error`, error.stack, 500, true);
            }
        });
    });
};

module.exports = chatSocket;
