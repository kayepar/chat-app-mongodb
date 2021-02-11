const Filter = require('bad-words');

const User = require('./models/user');
const Room = require('./models/room');
const Message = require('./models/message');

// todo: get routes back up again
// todo: change focus on e2e test - should be email
// todo: fixtures in unit tests
// todo: invalid email checking
// todo: remove try catch in models?

const chatSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('join', async ({ email, username, room }, callback) => {
            try {
                const chatRoom = await Room.createRoom(room);
                const userValid = await chatRoom.validateUser(email, username);

                if (!userValid) return callback('Username/Email Address already in use.');

                const user = await User.create({
                    sessionId: socket.id,
                    email,
                    username,
                    chatroom: chatRoom._id,
                });
                console.log(`${user.username} joined`);

                socket.join(room);

                socket.emit('message', Message.generateNotification('Admin', room, `Welcome, ${username}!`));
                socket.broadcast
                    .to(room)
                    .emit('message', Message.generateNotification('Admin', room, `${user.username} has joined!`));

                io.to(room).emit('roomData', {
                    room,
                    users: await chatRoom.getActiveUsers(),
                });

                // todo: handle error
                Room.getActiveRooms((error, rooms) => {
                    socket.broadcast.emit('activeRoomsUpdate', {
                        allActiveRooms: rooms,
                    });
                });

                callback();
            } catch (error) {
                // todo: fix error message - always saying duplicates (modal)
                console.log('try catch');
                console.log(error);
                // return callback(error);
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
            } catch (error) {
                console.log(error);
            }
            callback();
        });

        socket.on('typing', async (message, callback) => {
            try {
                const user = await User.findOne({ sessionId: socket.id });

                if (user) {
                    socket.broadcast
                        .to(user.chatroom.name)
                        .emit('typing', Message.generateNotification(user.username, user.chatroom.name, message));
                }
            } catch (error) {
                console.log(error);
            }

            callback();
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

                    io.to(room.name).emit('roomData', {
                        room: room.name,
                        users: await room.getActiveUsers(),
                    });
                }
            } catch (error) {
                console.log(error);
            }
        });
    });
};

module.exports = chatSocket;
