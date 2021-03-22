/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-done-callback */
const io = require('socket.io-client');
const server = require('../../../src/app');

const { configureDb } = require('./fixtures/db');
const RoomModel = require('../../models/room');
const UserModel = require('../../models/user');

let socketA;
let socketB;
let socketC;

const mockDate = new Date(1466424490000);

// const createSocket = () => {
//     return io('http://localhost', {
//         reconnection: false,
//         forceNew: true,
//         transports: ['websocket'],
//     });
// };

const createSocket = () => {
    return new Promise((resolve, reject) => {
        // create socket for communication
        const socket = io('http://localhost', {
            reconnection: false,
            forceNew: true,
            transports: ['websocket'],
        });

        // define event handler for sucessfull connection
        socket.on('connect', () => {
            // console.log('connected');
            resolve(socket);
        });

        // if connection takes longer than 5 seconds throw error
        setTimeout(() => {
            reject(new Error('Failed to connect within 5 seconds.'));
        }, 5000);
    });
};

jest.setTimeout(20000);

beforeAll((done) => {
    server.listen(80, () => {
        done();
    });
});

afterAll((done) => {
    server.close(() => {
        done();
    });
});

beforeEach(async () => {
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    Date.now = jest.fn().mockImplementation(() => '1466424490000');

    await configureDb();

    socketA = await createSocket();
    socketB = await createSocket();
    socketC = await createSocket();
});

afterEach((done) => {
    socketA.disconnect();
    socketB.disconnect();
    socketC.disconnect();
    done();
});

describe('integration tests for app - sockets', () => {
    describe('server connection', () => {
        test('should be able to connect to io server', (done) => {
            expect(socketA.connected).toBe(true);
            expect(socketB.connected).toBe(true);
            expect(socketC.connected).toBe(true);

            done();
        });
    });

    describe('join room', () => {
        test('if email and username are unique, user should be able to join in', (done) => {
            const testUser = { email: 'catherine.par@gmail.com', username: 'catherine', room: 'javascript' };

            socketA.emit('join', testUser, async (callback) => {
                const user = await UserModel.findOne({ email: testUser.email });

                expect(user).not.toBeNull();
                expect(user.chatroom.name).toBe(testUser.room);
                expect(callback).toBeUndefined(); // meaning there's no error in adding user to room

                done();
            });
        });

        test('multiple unique users should be able to join in', (done) => {
            const testUser1 = { email: 'user1@gmail.com', username: 'user1', room: 'html' };
            const testUser2 = { email: 'user2@gmail.com', username: 'user2', room: 'html' };

            socketA.emit('join', testUser1, (callback) => {
                expect(callback).toBeUndefined();
            });

            socketB.emit('join', testUser2, async (callback) => {
                expect(callback).toBeUndefined();

                const room = await RoomModel.findOne({ name: 'html' });

                expect(room.users).toHaveLength(2);

                done();
            });
        });

        test('if email is already in use, user should NOT be able to join in', (done) => {
            const testUser = { email: 'kaye.cenizal@gmail.com', username: 'catherine', room: 'javascript' };

            socketA.emit('join', testUser, (callback) => {
                expect(callback).toHaveProperty('cause', 'Username/Email address already in use');

                done();
            });
        });

        test('if username is already in use, user should NOT be able to join in', (done) => {
            const testUser = { email: 'kaye.cenizal@live.com', username: 'kaye', room: 'javascript' };

            socketA.emit('join', testUser, (callback) => {
                expect(callback).toHaveProperty('cause', 'Username/Email address already in use');

                done();
            });
        });

        test.only('if both email and username are already in use, user should NOT be able to join in', (done) => {
            // todo: need to check why user is still created
            const testUser = { email: 'user1@gmail.com', username: 'user1', room: 'html' };

            socketA.emit('join', testUser, async (callback) => {
                // const room = await RoomModel.findOne({ name: 'html' });

                // console.log(`room users - test: ${room.users}`);

                expect(callback).toBeUndefined();
            });

            setTimeout(() => {
                socketB.emit('join', testUser, (callback) => {
                    expect(callback).toHaveProperty('cause', 'Username/Email address already in use');

                    done();
                });
            }, 100);
        });

        test.only('if previous session disconnects and then same credentials are used again, user should be able to join in', async (done) => {
            const testUser = { email: 'user2@gmail.com', username: 'user2', room: 'css' };

            socketA.emit('join', testUser, async (callback) => {
                expect(callback).toBeUndefined();

                socketA.disconnect();

                expect(socketA.connected).toBe(false);
            });

            await new Promise((res) => setTimeout(res, 300));

            socketB.emit('join', testUser, async (callback) => {
                const user = await UserModel.findOne({ email: testUser.email });

                expect(user).not.toBeNull();
                expect(user.chatroom.name).toBe(testUser.room);
                expect(callback).toBeUndefined();

                done();
            });
        });
    });

    describe('send/receive messages', () => {
        describe('admin messages', () => {
            test('if new user, should get welcome message from admin upon joining', (done) => {
                const testUser = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

                socketA.emit('join', testUser, () => {});

                const testMessage = {
                    sender: {
                        username: 'Admin',
                    },
                    text: `Welcome, ${testUser.username}!`,
                    chatroom: testUser.room,
                    createdAt: new Date().getTime(),
                };

                socketA.on('message', async (message) => {
                    expect(message).toEqual(testMessage);

                    // const room = await RoomModel.findOne({ name: testUser.room });
                    // console.log(room);
                    // const messages = await room.getMessages();

                    // console.log(messages);

                    done();
                });
            });

            test('if existing user, should get notification from admin when someone joins room', (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'css' };

                socketA.emit('join', testUser1, () => {});
                socketB.emit('join', testUser2, () => {});

                const testMessage = {
                    sender: {
                        username: 'Admin',
                    },
                    text: `${testUser2.username} has joined!`,
                    chatroom: testUser1.room,
                    createdAt: new Date().getTime(),
                };

                let msgCount = 0;
                socketA.on('message', (message) => {
                    msgCount = msgCount += 1;

                    if (msgCount === 2) {
                        expect(message).toEqual(testMessage);
                    }
                    done();
                });
            });
        });

        describe('chatroom messages', () => {
            test('if in the same room, user should be able to receive messages sent over to the chatroom', async (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'css' };

                socketA.emit('join', testUser1, () => {});
                socketB.emit('join', testUser2, () => {});

                const testMessage = {
                    sender: {
                        username: testUser1.username,
                        email: testUser1.email,
                    },
                    text: `Hello ${testUser1.room}! My name is ${testUser1.username}`,
                    createdAt: new Date().toISOString(),
                };

                await new Promise((res) => setTimeout(res, 300));

                socketA.emit('sendMessage', `Hello ${testUser1.room}! My name is ${testUser1.username}`, () => {});

                socketB.on('message', (message) => {
                    expect(message).toEqual(testMessage);

                    done();
                });
            });

            test('if on a different room, user should not be able to receive message sent over to another chatroom', (done) => {});

            test('user should be able to receive own message', (done) => {});

            test('if message has profanity, should receive error message', (done) => {});
        });
    });

    describe('activeRooms update', () => {});

    describe('roomData update', () => {}); // todo: check the name - changed recently

    describe('disconnect from room', () => {});
});
