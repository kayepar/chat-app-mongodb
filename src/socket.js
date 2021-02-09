const Filter = require('bad-words');
// const mongoose = require('mongoose');

const User = require('./models/user');
const Room = require('./models/room');
const Message = require('./models/message');

// todo: see if socket middleware is really needed
// todo: get message model ready
// todo: get routes back up again
// todo: change focus on e2e test - should be email
// todo: fixtures in unit tests
// todo: invalid email checking
// todo: clear users and room (without messages?)

const chatSocket = (io) => {
    // io.use(function (socket, next) {
    //     const url = socket.handshake.headers.referer;
    //     const roomQs = /(?<=room=).+?(?=&)/.exec(url)[0];
    //     socket.room = roomQs;

    //     next();
    // });

    // todo: try to see if it's better to save room and validate user/save to db in middleware
    // then save them in socket for re-use in other events
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

                socket.emit('message', Message.generateAdminNotif(room, `Welcome, ${username}!`));
                socket.broadcast
                    .to(room)
                    .emit('message', Message.generateAdminNotif(room, `${user.username} has joined!`));

                io.to(room).emit('roomData', {
                    room,
                    users: await Room.getActiveUsers(chatRoom),
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
                await user.execPopulate('chatroom', 'name');
                io.to(user.chatroom.name).emit('message', await Message.generateMessage(user, message));
            } catch (error) {
                console.log(error);
            }
            callback();
        });

        // socket.on('typing', (message, callback) => {
        //     const user = getUser(socket.id);

        //     socket.broadcast.to(user.room).emit('typing', generateMessage(user.username, message));
        //     callback();
        // });

        socket.on('disconnect', async () => {
            try {
                const user = await User.findOne({ sessionId: socket.id });

                if (user) {
                    console.log(`${user.username} disconnected`);
                    await user.execPopulate('chatroom');

                    const deletedRoom = await Room.deleteIfInactive(user.chatroom, 'disconnect');
                    console.log(`deleted room: ${deletedRoom}`);

                    if (deletedRoom) {
                        Room.getActiveRooms((error, rooms) => {
                            if (error) throw new Error(error);

                            socket.broadcast.emit('activeRoomsUpdate', {
                                allActiveRooms: rooms,
                            });
                        });
                    } else {
                        io.to(user.chatroom.name).emit(
                            'message',
                            Message.generateAdminNotif(user.chatroom.name, `${user.username} has left!`)
                        );
                    }

                    await user.deleteOne();

                    io.to(user.chatroom.name).emit('roomData', {
                        room: user.chatroom.name,
                        users: await Room.getActiveUsers(user.chatroom),
                    });
                }
            } catch (error) {
                console.log(error);
            }
        });
    });
};

module.exports = chatSocket;
