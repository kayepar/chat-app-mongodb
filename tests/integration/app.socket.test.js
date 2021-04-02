/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-done-callback */
const io = require('socket.io-client');
const mongoose = require('mongoose');

const server = require('../../src/app');
const { configureDb } = require('../fixtures/db');

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
            resolve(socket);
        });

        // if connection takes longer than 5 seconds throw error
        setTimeout(() => {
            reject(new Error('Failed to connect within 5 seconds.'));
        }, 5000);
    });
};

const disconnectSocket = (socket) => {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        if (socket.connected) {
            socket.disconnect();
            resolve(true);
        } else {
            resolve(false);
        }
    });
};

jest.setTimeout(20000);

beforeAll((done) => {
    server.listen(80, () => {
        console.log('up');
        // done();

        setTimeout(() => {
            done();
        }, 1000);
    });
});

afterAll(async (done) => {
    await mongoose.connection.close();

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

    // 1 sec delay to let disconnection to finish
    setTimeout(() => {
        done();
    }, 1000);
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

                setTimeout(() => {
                    socketB.emit('join', testUser, async (callback) => {
                        expect(callback).toBeUndefined();

                        done();
                    });
                }, 300);
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

                setTimeout(() => {
                    socketB.emit('join', testUser, (callback) => {
                        expect(callback).toHaveProperty('cause', 'Username/Email address already in use');

                        done();
                    });
                }, 100);
            });

            test('if email is invalid, user should NOT be able to join in', (done) => {
                const testUser = { email: 'kaye.cenizal!live.com', username: 'kaye.cenizal', room: 'javascript' };

                socketA.emit('join', testUser, (callback) => {
                    expect(callback).toHaveProperty('cause', 'Invalid email address');

                    done();
                });
            });

            test('if email is missing, user should NOT be able to join in', (done) => {
                const testUser = { username: 'kaye.cenizal', room: 'javascript' };

                socketA.emit('join', testUser, (callback) => {
                    expect(callback).toHaveProperty('cause', 'Incomplete user details');

                    done();
                });
            });

            test('if username is missing, user should NOT be able to join in', (done) => {
                const testUser = { email: 'kaye.cenizal!live.com', username: '', room: 'javascript' };

                socketA.emit('join', testUser, (callback) => {
                    expect(callback).toHaveProperty('cause', 'Incomplete user details');

                    done();
                });
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

                setTimeout(() => {
                    socketB.emit('join', testUser2, () => {});
                }, 100);
            });

            test('if existing user, should get admin notification when someone leaves the same room', (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'css' };

                socketA.emit('join', testUser1, () => {});

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
                    socketB.emit('join', testUser2, (callback) => {
                        expect(callback).toBeUndefined();

                        socketB.disconnect();

                        expect(socketB.connected).toBe(false);
                    });
                }, 100);
            });

            test('user should not get notification from admin if someone from a different room leaves', (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'html' };

                socketA.emit('join', testUser1, () => {});

                let msgCount = 0;
                socketA.on('message', () => {
                    msgCount = msgCount += 1;
                });

                setTimeout(() => {
                    socketB.emit('join', testUser2, (callback) => {
                        expect(callback).toBeUndefined();

                        socketB.disconnect();

                        expect(socketB.connected).toBe(false);
                    });
                }, 100);

                setTimeout(() => {
                    expect(msgCount).toBe(1);

                    done();
                }, 200);
            });
        });

        describe('chatroom messages', () => {
            test('user should be able to send messages to the chatroom', async (done) => {
                const testUser = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

                socketA.emit('join', testUser, () => {});

                setTimeout(() => {
                    socketA.emit(
                        'sendMessage',
                        `Hello ${testUser.room}! My name is ${testUser.username}`,
                        (callback) => {
                            expect(callback).toBeUndefined();

                            done();
                        }
                    );
                }, 200);
            });

            test('user should be able to receive messages sent over to the chatroom', async (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'css' };

                socketA.emit('join', testUser1, () => {});

                const testMessage = {
                    sender: {
                        username: testUser1.username,
                        email: testUser1.email,
                    },
                    text: `Hello ${testUser1.room}! My name is ${testUser1.username}`,
                };

                let msgCount = 0;
                socketB.on('message', (message) => {
                    msgCount = msgCount += 1;

                    if (msgCount === 2) {
                        expect(message).toMatchObject(testMessage);

                        done();
                    }
                });

                setTimeout(() => {
                    socketB.emit('join', testUser2, () => {});
                }, 100);

                setTimeout(() => {
                    socketA.emit('sendMessage', `Hello ${testUser1.room}! My name is ${testUser1.username}`, () => {});
                }, 200);
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
                socketB.on('message', () => {
                    socketB_msgCount = socketB_msgCount += 1;

                    // only gets welcome message and not testUser1's
                    expect(socketB_msgCount).toBe(1);
                });

                let socketA_msgCount = 0;
                socketA.on('message', (message) => {
                    socketA_msgCount = socketA_msgCount += 1;

                    if (socketA_msgCount === 2) {
                        // gets own message back
                        expect(message).toMatchObject(testMessage);

                        done();
                    }
                });

                setTimeout(() => {
                    socketA.emit('sendMessage', `Hello! This is a message from '${testUser1.room}' room`, () => {});
                }, 500);
            });

            test('user should be able to receive own message', (done) => {
                const testUser = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

                const testMessage = {
                    sender: {
                        username: testUser.username,
                        email: testUser.email,
                    },
                    text: `Hello!`,
                };

                socketA.emit('join', testUser, () => {});

                let msgCount = 0;
                socketA.on('message', (message) => {
                    msgCount = msgCount += 1;

                    if (msgCount === 2) {
                        // gets own message back (first message would be the welcome message)
                        expect(message).toMatchObject(testMessage);

                        done();
                    }
                });

                setTimeout(() => {
                    socketA.emit('sendMessage', 'Hello!', () => {});
                }, 100);
            });

            test('if message has profanity, should generate error message', (done) => {
                const testUser = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

                socketA.emit('join', testUser, () => {});

                socketA.emit('sendMessage', 'damn', (callback) => {
                    expect(callback).toBe('Profanity is not allowed!');

                    done();
                });
            });

            test('if message has no text, should return a null message', (done) => {
                const testUser = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

                socketA.emit('join', testUser, () => {});

                let msgCount = 0;
                socketA.on('message', (message) => {
                    msgCount = msgCount += 1;

                    if (msgCount === 2) {
                        expect(message).toBeNull();

                        done();
                    }
                });

                setTimeout(() => {
                    socketA.emit('sendMessage', '', () => {});
                }, 100);
            });
        });
    });

    describe('activeRoomsUpdate event', () => {
        test(`if user joins a room, existing user (regardless of room) should get 'activeRoomsUpdate' event`, (done) => {
            const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
            const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'html' };

            socketA.emit('join', testUser1, () => {});
            socketB.emit('join', testUser2, () => {});

            const testResult = { allActiveRooms: ['javascript', 'css', 'html'] };

            socketA.on('activeRoomsUpdate', (message) => {
                expect(message).toEqual(testResult);

                done();
            });
        });

        test(`if user leaves, existing user (regardless of room) should get 'activeRoomsUpdate' event`, (done) => {
            const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
            const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'html' };

            socketA.emit('join', testUser1, () => {});

            const testResult = { allActiveRooms: ['javascript', 'css', 'html'] };

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
                socketB.emit('join', testUser2, (callback) => {
                    expect(callback).toBeUndefined();

                    socketB.disconnect();

                    expect(socketB.connected).toBe(false);
                });
            }, 300);
        });
    });

    describe('usersInRoomUpdate event', () => {
        test(`if user joins in, existing user in the same room should get 'usersInRoomUpdate' event`, async (done) => {
            const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'bootstrap' };
            const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'bootstrap' };
            const testUser3 = { email: 'john.par@gmail.com', username: 'john', room: 'bootstrap' };

            socketA.emit('join', testUser1, () => {});

            const testResult = { users: [{ username: 'kaye' }, { username: 'callie' }, { username: 'john' }] };

            let msgCount = 0;
            socketA.on('usersInRoomUpdate', (message) => {
                msgCount = msgCount += 1;

                if (msgCount === 3) {
                    expect(message.users).toHaveLength(3);
                    expect(message).toMatchObject(testResult);

                    done();
                }
            });

            setTimeout(() => {
                socketB.emit('join', testUser2, () => {});
                socketC.emit('join', testUser3, () => {});
            }, 200);
        });

        test(`if user leaves, existing user in the same room should get 'usersInRoomUpdate' event`, (done) => {
            const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'bootstrap' };
            const testUser2 = { email: 'john.par@gmail.com', username: 'john', room: 'bootstrap' };
            const testUser3 = { email: 'callie.par@gmail.com', username: 'callie', room: 'bootstrap' };

            socketA.emit('join', testUser1, () => {});

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
                socketB.emit('join', testUser2, () => {});
                socketC.emit('join', testUser3, (callback) => {
                    expect(callback).toBeUndefined();

                    socketC.disconnect();

                    expect(socketC.connected).toBe(false);
                });
            }, 300);
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
            const testUser = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

            socketA.emit('join', testUser, () => {});

            socketA.disconnect();

            expect(socketA.connected).toBe(false);

            done();
        });
    });
});
