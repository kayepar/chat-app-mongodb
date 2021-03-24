/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-done-callback */
const io = require('socket.io-client');
const server = require('../../../src/app');

const { configureDb } = require('./fixtures/db');
const RoomModel = require('../../models/room');
const UserModel = require('../../models/user');
// require('log-timestamp');

let socketA;
let socketB;
let socketC;

const createSocket = () => {
    return new Promise((resolve, reject) => {
        // create socket
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

const disconnectSocket = (socket) => {
    return new Promise((resolve, reject) => {
        // check if socket connected
        if (socket.connected) {
            // disconnect socket
            socket.disconnect();
            resolve(true);
        } else {
            // not connected
            resolve(false);
        }
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
    await configureDb();

    socketA = await createSocket();
    socketB = await createSocket();
    socketC = await createSocket();
});

afterEach(async (done) => {
    await disconnectSocket(socketA);
    await disconnectSocket(socketB);
    await disconnectSocket(socketC);

    // 1sec delay to let disconnection to finish
    await new Promise((res) => setTimeout(res, 1000));

    done();
});

describe('integration tests for app - sockets', () => {
    describe('server connection', () => {
        test('socket should be able to connect to io server', (done) => {
            expect(socketA.connected).toBe(true);
            expect(socketB.connected).toBe(true);
            expect(socketC.connected).toBe(true);

            done();
        });
    });

    describe('join room', () => {
        describe('success', () => {
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

            test('if multiple unique users, all should be able to join in', (done) => {
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

            test('if previous session disconnects and then same credentials are used again, user should be able to join in', async (done) => {
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

        describe('failure', () => {
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

            test('if both email and username are already in use, user should NOT be able to join in', async (done) => {
                const testUser = { email: 'user1@gmail.com', username: 'user1', room: 'html' };

                socketA.emit('join', testUser, (callback) => {
                    expect(callback).toBeUndefined();
                });

                await new Promise((res) => setTimeout(res, 100));

                socketB.emit('join', testUser, (callback) => {
                    expect(callback).toHaveProperty('cause', 'Username/Email address already in use');

                    done();
                });
            });

            // todo: invalid email
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
                };

                socketA.on('message', async (message) => {
                    expect(message).toMatchObject(testMessage);

                    done();
                });
            });

            test('if existing user, should get notification from admin when someone joins the same room', (done) => {
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
                };

                let msgCount = 0;
                socketA.on('message', (message) => {
                    msgCount = msgCount += 1;

                    // check for the second message since the first one is the welcome message
                    if (msgCount === 2) {
                        expect(message).toMatchObject(testMessage);

                        done();
                    }
                });
            });

            test('if existing user, should get notification when someone leaves the same room', (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'css' };

                socketA.emit('join', testUser1, () => {});
                socketB.emit('join', testUser2, () => {});

                const testMessage = {
                    sender: { username: 'Admin' },
                    chatroom: 'css',
                    text: `${testUser2.username} has left!`,
                };

                let msgCount = 0;
                socketA.on('message', (message) => {
                    msgCount = msgCount += 1;

                    // check the 3rd one, since the first couple of messages are welcome messages
                    if (msgCount === 3) {
                        expect(message).toMatchObject(testMessage);

                        done();
                    }
                });

                setTimeout(() => {
                    socketB.disconnect();

                    expect(socketB.connected).toBe(false);
                }, 100);
            });

            test('user should not get notification from admin if someone from a different room leaves', (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'html' };

                socketA.emit('join', testUser1, () => {});
                socketB.emit('join', testUser2, () => {});

                let msgCount = 0;
                socketA.on('message', (message) => {
                    msgCount = msgCount += 1;
                });

                setTimeout(() => {
                    socketB.disconnect();

                    expect(socketB.connected).toBe(false);
                }, 100);

                setTimeout(() => {
                    expect(msgCount).toBe(1); // meaning socketA only received the welcome message, not socketB's disconnection

                    done();
                }, 200);
            });
        });

        describe('chatroom messages', () => {
            test('user should be able to receive messages sent over to the chatroom', async (done) => {
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
                };

                await new Promise((res) => setTimeout(res, 300));

                socketA.emit('sendMessage', `Hello ${testUser1.room}! My name is ${testUser1.username}`, () => {});

                socketB.on('message', (message) => {
                    expect(message).toMatchObject(testMessage);

                    // todo: check db for saved message
                    done();
                });
            });

            test('user should not be able to receive messages sent over to a different chatroom', (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'html' };

                const testMessage = {
                    sender: {
                        username: testUser1.username,
                        email: testUser1.email,
                    },
                    text: `Hello! This is a message from '${testUser1.room}' room`,
                };

                socketA.emit('join', testUser1, () => {});
                socketB.emit('join', testUser2, () => {});

                let socketB_msgCount = 0;
                socketB.on('message', (message) => {
                    socketB_msgCount = socketB_msgCount += 1;

                    // only gets welcome message and not testUser1's
                    expect(socketB_msgCount).toBe(1);

                    // todo: check db, message should not be in socketB's room
                });

                let socketA_msgCount = 0;
                socketA.on('message', (message) => {
                    socketA_msgCount = socketA_msgCount += 1;

                    if (socketA_msgCount === 2) {
                        // gets own message back
                        // expect(message).toEqual(testMessage);
                        expect(message).toMatchObject(testMessage);

                        done();
                    }
                });

                setTimeout(() => {
                    socketA.emit('sendMessage', `Hello! This is a message from '${testUser1.room}' room`, () => {});
                }, 500);
            });

            test('user should be able to receive own message', (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

                const testMessage = {
                    sender: {
                        username: testUser1.username,
                        email: testUser1.email,
                    },
                    text: `Hello!`,
                };

                socketA.emit('join', testUser1, () => {});

                let msgCount = 0;
                socketA.on('message', (message) => {
                    msgCount = msgCount += 1;

                    if (msgCount === 2) {
                        // gets own message back (message1 === welcome message)
                        expect(message).toMatchObject(testMessage);

                        done();
                    }
                });

                setTimeout(() => {
                    socketA.emit('sendMessage', 'Hello!', () => {});
                }, 100);
            });

            test('if message has profanity, generate error message', (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

                socketA.emit('join', testUser1, () => {});

                socketA.emit('sendMessage', 'damn', (callback) => {
                    expect(callback).toBe('Profanity is not allowed!');

                    done();
                });
            });
        });
    });

    describe('activeRoomsUpdate event', () => {
        test(`if another user joins a room, existing user (regardless of room) should get 'activeRoomsUpdate' event`, (done) => {
            const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
            const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'html' };

            socketA.emit('join', testUser1, () => {});
            socketB.emit('join', testUser2, () => {});

            const testResult = { allActiveRooms: ['javascript', 'css', 'html'] };

            socketA.on('activeRoomsUpdate', (message) => {
                expect(message).toEqual(testResult);

                // todo: test getting data from db
                done();
            });
        });

        test(`if another user leaves, existing user (regardless of room) should get 'activeRoomsUpdate' event`, (done) => {
            // todo: db test that room becomes inactive when the last user leaves (and if it has no saved messages)

            const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
            const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'html' };

            socketA.emit('join', testUser1, () => {});
            socketB.emit('join', testUser2, () => {});

            const testResult = { allActiveRooms: ['javascript', 'css'] };

            let msgCount = 0;
            socketA.on('activeRoomsUpdate', (message) => {
                msgCount = msgCount += 1;

                if (msgCount === 2) {
                    // first message is 'activeRoomsUpdate' when own socket joins
                    expect(message).toEqual(testResult);

                    done();
                }
            });

            setTimeout(() => {
                socketB.disconnect();

                expect(socketB.connected).toBe(false);
            }, 500);
        });
    });

    describe('usersInRoomUpdate event', () => {
        test(`if user joins in, existing user in the same room should get 'usersInRoomUpdate' event`, (done) => {
            const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'html' };
            const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'html' };
            const testUser3 = { email: 'john.par@gmail.com', username: 'john', room: 'html' };

            socketA.emit('join', testUser1, () => {});
            socketB.emit('join', testUser2, () => {});
            socketC.emit('join', testUser3, () => {});

            const testResult = { users: [{ username: 'kaye' }, { username: 'callie' }, { username: 'john' }] };

            let msgCount = 0;
            socketA.on('usersInRoomUpdate', (message) => {
                msgCount = msgCount += 1;

                expect(message.users).toHaveLength(3);
                expect(message).toMatchObject(testResult);

                done();
            });
        });

        test(`if user leaves, existing user in the same room should get 'usersInRoomUpdate' event`, (done) => {
            const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'html' };
            const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'html' };
            const testUser3 = { email: 'john.par@gmail.com', username: 'john', room: 'html' };

            socketA.emit('join', testUser1, () => {});
            socketB.emit('join', testUser2, () => {});
            socketC.emit('join', testUser3, () => {});

            const testResult = { users: [{ username: 'kaye' }, { username: 'john' }] };

            let msgCount = 0;
            socketA.on('usersInRoomUpdate', (message) => {
                msgCount = msgCount += 1;

                // first 3 messages are 'usersInRoomUpdate' events received after users joined
                if (msgCount === 4) {
                    expect(message).toMatchObject(testResult);

                    done();
                }
            });

            setTimeout(() => {
                socketB.disconnect();

                expect(socketB.connected).toBe(false);
            }, 500);
        });
    });

    describe('typing indicator', () => {
        test('if another user starts typing, existing user in the same room should get typing indicator', (done) => {
            const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
            const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'css' };

            socketA.emit('join', testUser1, () => {});
            socketB.emit('join', testUser2, () => {});

            const testMessage = {
                sender: { username: 'kaye' },
                chatroom: 'css',
                text: '...',
            };

            socketB.on('typing', (message) => {
                expect(message).toMatchObject(testMessage);

                done();
            });

            setTimeout(() => {
                socketA.emit('typing', '...', () => {});
            }, 100);
        });
    });

    describe('disconnect from room', () => {
        test('user should be disconnected', (done) => {
            const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

            socketA.emit('join', testUser1, () => {});

            socketA.disconnect();

            expect(socketA.connected).toBe(false);

            done();

            // todo: check this on db level
        });
    });
});
