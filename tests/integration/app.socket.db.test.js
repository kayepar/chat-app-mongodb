/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-done-callback */
const io = require('socket.io-client');
const server = require('../../src/app');
const mongoose = require('mongoose');

const { configureDb } = require('../fixtures/db');
const RoomModel = require('../../src/models/room');
const UserModel = require('../../src/models/user');

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

describe('Integration tests for app - sockets and db', () => {
    describe('Server connection', () => {
        test('Socket should be able to connect to IO server', (done) => {
            expect(socketA.connected).toBe(true);
            expect(socketB.connected).toBe(true);
            expect(socketC.connected).toBe(true);

            done();
        });
    });

    describe('Create room', () => {
        test('If room is not yet existing, it should be created and saved to db', async (done) => {
            // note: room will be automatically created once a user joins in
            const testUser = { email: 'catherine.par@gmail.com', username: 'catherine', room: 'node.js' };

            const testUserRoom = await RoomModel.findOne({ name: testUser.room });

            // room is not existing
            expect(testUserRoom).toBeNull();

            socketA.emit('join', testUser, async (callback) => {
                expect(callback).toBeUndefined();

                const room = await RoomModel.findOne({ name: testUser.room });

                // room has been created
                expect(room).not.toBeNull();

                done();
            });
        });

        test('If room is existing, it should be reused instead of creating a duplicate', async (done) => {
            // note: room will be automatically created once a user joins in
            const testUser = { email: 'catherine.par@gmail.com', username: 'catherine', room: 'javascript' };

            const testUserRoom = await RoomModel.findOne({ name: testUser.room });

            // room is already existing
            expect(testUserRoom).not.toBeNull();

            socketA.emit('join', testUser, async (callback) => {
                expect(callback).toBeUndefined();

                const room = await RoomModel.findOne({ name: testUser.room });

                expect(room._id).toStrictEqual(testUserRoom._id);

                done();
            });
        });
    });

    describe('Join room', () => {
        describe('Success', () => {
            test('If email and username are unique (in specific room), user should be saved to db', (done) => {
                const testUser = { email: 'catherine.par@gmail.com', username: 'catherine', room: 'javascript' };

                socketA.emit('join', testUser, async (callback) => {
                    expect(callback).toBeUndefined();

                    const user = await UserModel.findOne({ sessionId: socketA.id });

                    expect(user).not.toBeNull();
                    expect(user.chatroom.name).toBe(testUser.room);

                    done();
                });
            });

            test('If multiple unique users (in specific room), all should be saved to db', (done) => {
                const testUser1 = { email: 'user1@gmail.com', username: 'user1', room: 'test' };
                const testUser2 = { email: 'user2@gmail.com', username: 'user2', room: 'test' };

                socketA.emit('join', testUser1, () => {});

                socketB.emit('join', testUser2, async (callback) => {
                    expect(callback).toBeUndefined();

                    const room = await RoomModel.findOne({ name: 'test' });

                    expect(room.users).toHaveLength(2);

                    done();
                });
            });

            test('If previous session disconnects and then same credentials are used again, user should be saved to db', async (done) => {
                const testUser = { email: 'user2@gmail.com', username: 'user2', room: 'css' };

                socketA.emit('join', testUser, async (callback) => {
                    expect(callback).toBeUndefined();

                    socketA.disconnect();

                    expect(socketA.connected).toBe(false);
                });

                setTimeout(() => {
                    socketB.emit('join', testUser, async (callback) => {
                        expect(callback).toBeUndefined();

                        const user = await UserModel.findOne({ sessionId: socketB.id });

                        expect(user).not.toBeNull();
                        expect(user.chatroom.name).toBe(testUser.room);

                        done();
                    });
                }, 300);
            });
        });
    });

    describe('Failure', () => {
        test('If email is already in use, user should NOT be saved to db', (done) => {
            const testUser = { email: 'kaye.cenizal@gmail.com', username: 'catherine', room: 'javascript' };

            socketA.emit('join', testUser, async () => {
                const room = await RoomModel.findOne({ name: testUser.room });
                const user = room.users.find((user) => user.email === testUser.email);

                expect(user.sessionId).not.toBe(socketA.id);

                done();
            });
        });

        test('If username is already in use, user should NOT be saved to db', (done) => {
            const testUser = { email: 'kaye.cenizal@live.com', username: 'kaye', room: 'javascript' };

            socketA.emit('join', testUser, async () => {
                const room = await RoomModel.findOne({ name: testUser.room });
                const user = room.users.find((user) => user.username === testUser.username);

                expect(user.sessionId).not.toBe(socketA.id);

                done();
            });
        });

        test('If both email and username are already in use, user should NOT be saved to db', async (done) => {
            const testUser = { email: 'user1@gmail.com', username: 'user1', room: 'html' };

            socketA.emit('join', testUser, (callback) => {
                expect(callback).toBeUndefined();
            });

            setTimeout(() => {
                socketB.emit('join', testUser, async () => {
                    const room = await RoomModel.findOne({ name: testUser.room });
                    const user = room.users.find((user) => user.email === testUser.email);

                    expect(user.sessionId).not.toBe(socketB.id);

                    done();
                });
            }, 100);
        });

        test('If email is invalid, user should NOT be saved to db', (done) => {
            const testUser = { email: 'kaye.cenizal!live.com', username: 'kaye.cenizal', room: 'javascript' };

            socketA.emit('join', testUser, async () => {
                const room = await RoomModel.findOne({ name: testUser.room });

                const user = room.users.find((user) => user.email === testUser.email);

                expect(user).toBeUndefined();

                done();
            });
        });
    });

    describe('Chatroom messages', () => {
        test('Sent message should be saved to db', async (done) => {
            const testUser = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

            socketA.emit('join', testUser, (callback) => {
                expect(callback).toBeUndefined();
            });

            setTimeout(() => {
                socketA.emit('sendMessage', 'Hello!', async () => {
                    const room = await RoomModel.findOne({ name: testUser.room });
                    const allMessages = await room.getMessages();

                    // get only messages from testUser
                    const userMessages = allMessages.reduce((text, message) => {
                        if (message.sender.email === testUser.email) {
                            text.push(message.text);
                        }

                        return text;
                    }, []);

                    expect(userMessages).toEqual(expect.arrayContaining(['Hello!']));

                    done();
                });
            }, 300);
        });

        test('If message has profanity, it should NOT be saved to db', (done) => {
            const testUser = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

            socketA.emit('join', testUser, (callback) => {
                expect(callback).toBeUndefined();
            });

            socketA.emit('sendMessage', 'damn', async () => {
                const room = await RoomModel.findOne({ name: testUser.room });
                const allMessages = await room.getMessages();

                expect(allMessages).toHaveLength(0);

                done();
            });
        });
    });

    describe('activeRooms event', () => {
        describe('On join', () => {
            test('Room should be added to active rooms list', async (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'python' };

                socketA.emit('join', testUser1, async (callback) => {
                    expect(callback).toBeUndefined();

                    const activeRooms = await RoomModel.getActiveRooms();

                    expect(activeRooms).toStrictEqual(['javascript', 'css', 'html']);
                });

                setTimeout(() => {
                    socketB.emit('join', testUser2, async (callback) => {
                        expect(callback).toBeUndefined();

                        const activeRooms = await RoomModel.getActiveRooms();

                        expect(activeRooms).toStrictEqual(['javascript', 'css', 'html', 'python']);

                        done();
                    });
                }, 300);
            });
        });

        describe('On disconnect', () => {
            test('If room still has other active users, it should remain on activeRooms list', async (done) => {
                const testUser = { email: 'catherine.par@gmail.com', username: 'catherine', room: 'javascript' };

                socketA.emit('join', testUser, async (callback) => {
                    expect(callback).toBeUndefined();

                    socketA.disconnect();
                });

                setTimeout(async () => {
                    const activeRooms = await RoomModel.getActiveRooms();

                    expect(activeRooms).toEqual(expect.arrayContaining([testUser.room]));

                    done();
                }, 200);
            });

            test('If room has no active users left, it should be removed from activeRooms list', async (done) => {
                const testUser = { email: 'catherine.par@gmail.com', username: 'catherine', room: 'java' };

                socketA.emit('join', testUser, async (callback) => {
                    expect(callback).toBeUndefined();

                    socketA.disconnect();
                });

                setTimeout(async () => {
                    const activeRooms = await RoomModel.getActiveRooms();

                    expect(activeRooms).toEqual(expect.not.arrayContaining([testUser.room]));

                    done();
                }, 500);
            });
        });
    });

    describe('usersInRoom event', () => {
        describe('On join', () => {
            test('User should be included in activeUsers list', async (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'bootstrap' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'bootstrap' };
                const testUser3 = { email: 'john.par@gmail.com', username: 'john', room: 'bootstrap' };

                socketA.emit('join', testUser1, () => {});
                socketB.emit('join', testUser2, () => {});
                socketC.emit('join', testUser3, () => {});

                setTimeout(async () => {
                    const room = await RoomModel.findOne({ name: testUser1.room });
                    const users = await room.getActiveUsers();

                    expect(users).toHaveLength(3);

                    done();
                }, 1000);
            });
        });

        describe('On disconnect', () => {
            test('Disconnected user should be removed from activeUsers list', (done) => {
                const testUser1 = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'bootstrap' };
                const testUser2 = { email: 'john.par@gmail.com', username: 'john', room: 'bootstrap' };
                const testUser3 = { email: 'callie.par@gmail.com', username: 'callie', room: 'bootstrap' };

                socketA.emit('join', testUser1, () => {});
                socketB.emit('join', testUser2, () => {});

                const testUsers = [{ username: 'kaye' }, { username: 'john' }];

                setTimeout(() => {
                    socketC.emit('join', testUser3, (callback) => {
                        expect(callback).toBeUndefined();

                        socketC.disconnect();

                        expect(socketC.connected).toBe(false);
                    });
                }, 300);

                setTimeout(async () => {
                    const room = await RoomModel.findOne({ name: testUser1.room });
                    const users = await room.getActiveUsers();

                    expect(users).toHaveLength(2);
                    expect(users).toMatchObject(testUsers);

                    done();
                }, 200);
            });
        });
    });

    describe('Disconnect from room', () => {
        describe('User cleanup', () => {
            test('User be deleted from db', (done) => {
                const testUser = { email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'css' };

                socketA.emit('join', testUser, async () => {
                    socketA.disconnect();

                    const user = await UserModel.findOne({ sessionId: socketA.id });

                    expect(user).toBeNull();

                    done();
                });
            });
        });

        describe('Room cleanup', () => {
            test('If room has users, it should NOT be deleted from db', async (done) => {
                const testUser1 = { email: 'catherine.par@gmail.com', username: 'catherine', room: 'java' };
                const testUser2 = { email: 'callie.par@gmail.com', username: 'callie', room: 'java' };

                socketA.emit('join', testUser1, (callback) => {
                    expect(callback).toBeUndefined();
                });

                setTimeout(() => {
                    socketB.emit('join', testUser2, (callback) => {
                        expect(callback).toBeUndefined();

                        socketB.disconnect();
                    });
                }, 200);

                setTimeout(async () => {
                    const room = await RoomModel.findOne({ name: testUser1.room });

                    expect(room).not.toBeNull();

                    done();
                }, 400);
            });

            test('If room has no users, it should be deleted from db', async (done) => {
                const testUser = { email: 'catherine.par@gmail.com', username: 'catherine', room: 'java' };

                socketA.emit('join', testUser, (callback) => {
                    expect(callback).toBeUndefined();

                    socketA.disconnect();
                });

                setTimeout(async () => {
                    const room = await RoomModel.findOne({ name: testUser.room });

                    expect(room).toBeNull();

                    done();
                }, 300);
            });

            test('If room has no users but has saved messages, it should NOT be deleted from db', async (done) => {
                const testUser = { email: 'catherine.par@gmail.com', username: 'catherine', room: 'java' };

                socketA.emit('join', testUser, (callback) => {
                    expect(callback).toBeUndefined();
                });

                setTimeout(() => {
                    socketA.emit('sendMessage', 'hello!', () => {});
                    socketA.disconnect();
                }, 200);

                setTimeout(async () => {
                    const room = await RoomModel.findOne({ name: testUser.room });

                    expect(room).not.toBeNull();

                    done();
                }, 300);
            });
        });
    });
});
