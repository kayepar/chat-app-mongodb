const Filter = require('bad-words');

const User = require('./models/user');
const Room = require('./models/room');
const Message = require('./models/message');

const CustomError = require('./error/CustomError');
const logger = require('./utilities/logger');

// test todos:
// todo: change focus on e2e test - should be email
// todo: feedback error messages for email
// todo: fixtures in unit tests
// todo: re-login to show saved messages
// todo: customerror - accept object instead?

const chatSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('join', async ({ email, username, room }, callback) => {
            try {
                const chatRoom = await Room.createRoom(room);
                const result = chatRoom.isUserAllowedToJoin(email, username);

                if (!result.isAllowed)
                    throw new CustomError('Invalid request', 'Username/Email address already in use', 400);

                const user = await User.create({
                    sessionId: socket.id,
                    email,
                    username,
                    chatroom: chatRoom._id,
                });
                logger.info(`${user.username} joined ${room}`);

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

                socket.broadcast.emit('activeRoomsUpdate', {
                    allActiveRooms: await Room.getActiveRooms(),
                });

                callback();
            } catch (error) {
                logger.error(error);

                if (error instanceof CustomError) {
                    callback(error);
                } else {
                    new CustomError(`Socket 'join' error`, error.stack, 500, true);
                }
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
                logger.error(error);
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
                logger.error(error);
                new CustomError(`Socket 'typing' error`, error.stack, 500, true);
            }
        });

        socket.on('disconnect', async () => {
            try {
                const user = await User.findOne({ sessionId: socket.id });

                if (user) {
                    logger.info(`${user.username} disconnected from ${user.chatroom.name}`);
                    await user.deleteOne();

                    const room = user.chatroom;
                    await room.deleteIfInactive('disconnect');

                    socket.broadcast.emit('activeRoomsUpdate', {
                        allActiveRooms: await Room.getActiveRooms(),
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
                logger.error(error);
                new CustomError(`Socket 'disconnect' error`, error.stack, 500, true);
            }
        });
    });
};

module.exports = chatSocket;
