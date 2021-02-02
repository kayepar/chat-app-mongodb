const Filter = require('bad-words');
require('./db/mongoose');
// const mongoose = require('mongoose');

const User = require('./models/user');
const Room = require('./models/room');

// todo: see if socket middleware is really needed
// todo: get message model ready
// todo: get routes back up again
// todo: change focus on e2e test - should be email
// todo: invalid email checking
// todo: clear users and room (without messages?)

const chatSocket = (io) => {
    const saveRoom = async (room) => {
        try {
            const result = await Room.create({ name: room }).then(null, async (error) => {
                if (error.code === 11000) {
                    // if duplicate, return existing
                    return await Room.findOne({ name: room });
                } else {
                    throw new Error(error);
                }
            });

            return await result.execPopulate('users');
        } catch (error) {
            console.log(error);
        }
    };

    // io.use(function (socket, next) {
    //     const url = socket.handshake.headers.referer;
    //     const roomQs = /(?<=room=).+?(?=&)/.exec(url)[0];
    //     socket.room = roomQs;

    //     next();
    // });

    io.on('connection', (socket) => {
        socket.on('join', async ({ email, username, room }, callback) => {
            try {
                const savedRoom = await saveRoom(room);
                const roomUsers = savedRoom.users;
                console.log(roomUsers);
                if (
                    roomUsers.some((user) => user.email === email) ||
                    roomUsers.some((user) => user.username === username)
                )
                    throw new Error('Username/Email Address already in use.');

                const user = new User({
                    sessionId: socket.id,
                    email,
                    username,
                    chatroom: savedRoom._id,
                });

                // console.log(user);

                await user.save();
                socket.join(savedRoom.name);

                // socket.emit('message', generateMessage('Admin', `Welcome, ${username}!`));
                // socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

                // io.to(user.room).emit('roomData', {
                //     room: user.room,
                //     users: getUsersInRoom(user.room),
                // });

                // socket.broadcast.emit('activeRoomsUpdate', {
                //     allActiveRooms: getAllActiveRooms(),
                // });

                callback();
            } catch (error) {
                console.log(error);
                return callback(error);
            }
        });

        socket.on('sendMessage', (message, callback) => {
            // console.log('sendMessage');
            // console.log(socket.room);
            // console.log(socket.roomId);
            // const filter = new Filter();

            // if (filter.isProfane(message)) {
            //     return callback('Profanity is not allowed!');
            // }

            // const user = getUser(socket.id);
            // io.to(user.room).emit('message', generateMessage(user.username, message));
            callback();
        });

        // socket.on('typing', (message, callback) => {
        //     const user = getUser(socket.id);

        //     socket.broadcast.to(user.room).emit('typing', generateMessage(user.username, message));
        //     callback();
        // });

        socket.on('disconnect', async () => {
            const user = await User.findOneAndDelete({ sessionId: socket.id });

            if (user) {
                try {
                    const room = await Room.findOne({ _id: user.chatroom }).then(async (room) => {
                        return await room.execPopulate('users');
                    });

                    console.log(room.users);

                    if (room.users.length === 0) {
                        await room.deleteOne();
                    }
                    // todo: check messages first before actually deleting
                } catch (error) {
                    console.log(error);
                }
            }

            // if (user) {
            //     io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
            //     io.to(user.room).emit('roomData', {
            //         room: user.room,
            //         users: getUsersInRoom(user.room),
            //     });
            //     // check if there are are still active users in the room
            //     const usersInRoom = getUsersInRoom(user.room);
            //     if (usersInRoom.length === 0) {
            //         // if no one is online, send a message to everyone to remove room from sidebar
            //         socket.broadcast.emit('activeRoomsUpdate', {
            //             allActiveRooms: getAllActiveRooms(),
            //         });
            //     }
            // }
        });
    });
};

module.exports = chatSocket;
