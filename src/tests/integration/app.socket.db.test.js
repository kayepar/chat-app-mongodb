/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-done-callback */
const io = require('socket.io-client');
const server = require('../../app');
const mongoose = require('mongoose');

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
        done();
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

    // 1sec delay to let disconnection to finish
    await new Promise((res) => setTimeout(res, 1000));

    done();
});

describe('integration tests for app - sockets and db', () => {
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
            test('if email and username are unique (in specific room), user should be saved to db', (done) => {
                const testUser = { email: 'catherine.par@gmail.com', username: 'catherine', room: 'javascript' };

                socketA.emit('join', testUser, async (callback) => {
                    expect(callback).toBeUndefined(); // meaning there's no error in adding user to room

                    // todo: try using socket session id to query then just check the chatroom name
                    const room = await RoomModel.findOne({ name: 'javascript' });

                    expect(room.users).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({ email: testUser.email, username: testUser.username }),
                        ])
                    );

                    done();
                });
            });

            test('if multiple unique users (in specific room), all should be saved to db', (done) => {
                const testUser1 = { email: 'user1@gmail.com', username: 'user1', room: 'test' };
                const testUser2 = { email: 'user2@gmail.com', username: 'user2', room: 'test' };

                socketA.emit('join', testUser1, () => {});

                socketB.emit('join', testUser2, async (callback) => {
                    const room = await RoomModel.findOne({ name: 'test' });

                    expect(room.users).toHaveLength(2);

                    done();
                });
            });

            test('if previous session disconnects and then same credentials are used again, user should saved to db', async (done) => {
                const testUser = { email: 'user2@gmail.com', username: 'user2', room: 'css' };

                socketA.emit('join', testUser, async (callback) => {
                    socketA.disconnect();

                    expect(socketA.connected).toBe(false);
                });

                await new Promise((res) => setTimeout(res, 300));

                socketB.emit('join', testUser, async (callback) => {
                    const user = await UserModel.findOne({ sessionId: socketB.id });

                    expect(user).not.toBeNull();
                    expect(user.chatroom.name).toBe(testUser.room);

                    done();
                });
            });
        });
    });

    describe('failure', () => {
        test('if email is already in use, user should NOT be able saved to db', (done) => {
            const testUser = { email: 'kaye.cenizal@gmail.com', username: 'catherine', room: 'javascript' };

            socketA.emit('join', testUser, async (callback) => {
                const user = await UserModel.findOne({ email: testUser.email });

                expect(user).not.toBeNull();
                expect(user.sessionId).not.toBe(socketA.id);

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

        test('if email is invalid, should return error', (done) => {
            const testUser = { email: 'kaye.cenizal!live.com', username: 'kaye.cenizal', room: 'javascript' };

            socketA.emit('join', testUser, (callback) => {
                expect(callback).toHaveProperty('cause', 'Invalid email address');

                done();
            });
        });
    });
});
