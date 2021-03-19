/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-done-callback */
const io = require('socket.io-client');
const server = require('../../../src/app');

const { configureDb } = require('./fixtures/db');
const RoomModel = require('../../models/room');

beforeEach(configureDb);

let socketA;
let socketB;
let socketC;

const mockDate = new Date(1466424490000);

const createSocket = () => {
    return io('http://localhost', {
        reconnection: false,
        forceNew: true,
        transports: ['websocket'],
    });
};

jest.setTimeout(20000);

beforeAll((done) => {
    // pass a callback to tell jest it is async
    server.listen(80, () => {
        done();
    });
});

afterAll((done) => {
    server.close(() => {
        done();
    });
});

beforeEach((done) => {
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    socketA = createSocket().on('connect', () => {});
    socketB = createSocket().on('connect', () => {});
    socketC = createSocket().on('connect', () => {
        done();
    });
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

    describe('join emit event', () => {});
});
