const request = require('supertest');
const app = require('../../src/app');

const mongoose = require('mongoose');

const { configureDb } = require('../fixtures/db');
const RoomModel = require('../../src/models/room');

beforeEach(configureDb);

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Integration tests for app routes', () => {
    describe('/validateUser route', () => {
        describe('Invalid responses', () => {
            test('If room parameter is missing, should send HTTP 400 error', async () => {
                const response = await request(app).get('/validateUser?email=kaye.cenizal@gmail.com&username=kaye');

                expect(response.status).toEqual(400);
            });

            test('If email parameter is missing, should send HTTP 400 error', async () => {
                const response = await request(app).get('/validateUser?username=kaye&room=javascript');

                expect(response.status).toEqual(400);
            });

            test('If username parameter is missing, should send HTTP 400 error', async () => {
                const response = await request(app).get('/validateUser?username=kaye&room=javascript');

                expect(response.status).toEqual(400);
            });

            test('If email address is invalid, should send HTTP 400 error', async () => {
                const response = await request(app).get(
                    '/validateUser?email=kaye.cenizal!gmail.com&username=kaye&room=javascript'
                );

                expect(response.status).toEqual(400);
            });

            test('If any other issue is encountered, should send HTTP 500 error', async () => {
                const findOneMock = jest.spyOn(RoomModel, 'findOne');
                findOneMock.mockImplementationOnce(() => {
                    throw new Error('Integration test: Something went wrong');
                });

                const response = await request(app).get(
                    '/validateUser?email=kaye.cenizal@gmail.com&username=kaye&room=javascript'
                );

                expect(response.status).toEqual(500);
            });
        });

        describe('Valid responses', () => {
            describe('non-existing room', () => {
                test('If credentials are valid, user should be allowed to join in', async () => {
                    const response = await request(app).get(
                        '/validateUser?email=chatuser1@example.com&username=chatuser1&room=testroom'
                    );

                    const expectedResults = { result: { isAllowed: true, duplicateFields: [] } };

                    expect(response.status).toEqual(200);
                    expect(response.body).toEqual(expectedResults);
                });
            });

            describe('Existing room', () => {
                test('If credentials are valid, user should be allowed to join in', async () => {
                    const response = await request(app).get(
                        '/validateUser?email=chatuser1@example.com&username=chatuser1&room=html'
                    );

                    const expectedResults = { result: { isAllowed: true, duplicateFields: [] } };

                    expect(response.status).toEqual(200);
                    expect(response.body).toEqual(expectedResults);
                });

                test('If email already in use, user should NOT be allowed to join in', async () => {
                    const response = await request(app).get(
                        '/validateUser?email=kaye.cenizal@gmail.com&username=kcenizal&room=javascript'
                    );

                    const expectedResults = { result: { isAllowed: false, duplicateFields: ['email'] } };

                    expect(response.status).toEqual(200);
                    expect(response.body).toEqual(expectedResults);
                });

                test('If username already in use, user should NOT be allowed to join in', async () => {
                    const response = await request(app).get(
                        '/validateUser?email=callie.madison.par@gmail.com&username=callie&room=javascript'
                    );

                    const expectedResults = { result: { isAllowed: false, duplicateFields: ['username'] } };

                    expect(response.status).toEqual(200);
                    expect(response.body).toEqual(expectedResults);
                });

                test('If both email and username are in use, user should NOT be allowed to join in', async () => {
                    const response = await request(app).get(
                        '/validateUser?email=john.par@gmail.com&username=john&room=css'
                    );

                    const expectedResults = { result: { isAllowed: false, duplicateFields: ['email', 'username'] } };

                    expect(response.status).toEqual(200);
                    expect(response.body).toEqual(expectedResults);
                });
            });
        });
    });

    describe('/getActiveRooms route', () => {
        describe('Invalid responses', () => {
            test('If error is encountered, should return HTTP 500', async () => {
                const getActiveRoomsMock = jest.spyOn(RoomModel, 'getActiveRooms');
                getActiveRoomsMock.mockImplementationOnce(() => {
                    throw new Error('Integration test: Something went wrong');
                });

                const response = await request(app).get('/getActiveRooms');

                expect(response.status).toEqual(500);
            });
        });

        describe('Valid responses', () => {
            test('If there are no active rooms, should return empty array', async () => {
                await RoomModel.deleteMany();

                const response = await request(app).get('/getActiveRooms');

                expect(response.status).toEqual(200);
                expect(response.body.rooms).toEqual([]);
            });

            test('If there are active rooms, should return array of room names', async () => {
                const expectedResults = ['javascript', 'css', 'html'];
                const response = await request(app).get('/getActiveRooms');

                expect(response.status).toEqual(200);
                expect(response.body.rooms).toEqual(expectedResults);
            });
        });
    });
});
