const request = require('supertest');
const app = require('../../app');

const mongoose = require('mongoose');

const { configureDb } = require('../fixtures/db');
const RoomModel = require('../../models/room');

beforeEach(configureDb);

afterAll(async () => {
    await mongoose.connection.close();
});

describe('integration tests for app routes', () => {
    describe('/validateUser route', () => {
        describe('invalid responses', () => {
            test('if room parameter is missing, should send HTTP 400 error', async () => {
                const response = await request(app).get(`/validateUser?email=kaye.cenizal@gmail.com&username=kaye`);

                expect(response.status).toEqual(400);
            });

            test('if email parameter is missing, should send HTTP 400 error', async () => {
                const response = await request(app).get(`/validateUser?username=kaye&room=javascript`);

                expect(response.status).toEqual(400);
            });

            test('if username parameter is missing, should send HTTP 400 error', async () => {
                const response = await request(app).get(`/validateUser?username=kaye&room=javascript`);

                expect(response.status).toEqual(400);
            });

            test('if email address is invalid, should send HTTP 400 error', async () => {
                const response = await request(app).get(
                    `/validateUser?email=kaye.cenizal!gmail.com&username=kaye&room=javascript`
                );

                expect(response.status).toEqual(400);
            });

            test('if any other issue is encountered, should send HTTP 500 error', async () => {
                const findOneMock = jest.spyOn(RoomModel, 'findOne');
                findOneMock.mockImplementationOnce(() => {
                    throw new Error('Integration test: Something went wrong');
                });

                const response = await request(app).get(
                    `/validateUser?email=kaye.cenizal@gmail.com&username=kaye&room=javascript`
                );

                expect(response.status).toEqual(500);
            });
        });

        describe('valid responses', () => {
            describe('non existing room', () => {
                test('if credentials are valid, user should be allowed to join in', async () => {
                    const response = await request(app).get(
                        `/validateUser?email=chatuser1@example.com&username=chatuser1&room=testroom`
                    );

                    const expectedResults = { result: { isAllowed: true, duplicateFields: [] } };

                    expect(response.status).toEqual(200);
                    expect(response.body).toEqual(expectedResults);
                });
            });

            describe('existing room', () => {
                test('if credentials are valid, user should be allowed to join in', async () => {
                    const response = await request(app).get(
                        `/validateUser?email=chatuser1@example.com&username=chatuser1&room=html`
                    );

                    const expectedResults = { result: { isAllowed: true, duplicateFields: [] } };

                    expect(response.status).toEqual(200);
                    expect(response.body).toEqual(expectedResults);
                });

                test(`if email already in use, user should NOT be allowed to join in`, async () => {
                    const response = await request(app).get(
                        `/validateUser?email=kaye.cenizal@gmail.com&username=kcenizal&room=javascript`
                    );

                    const expectedResults = { result: { isAllowed: false, duplicateFields: ['email'] } };

                    expect(response.status).toEqual(200);
                    expect(response.body).toEqual(expectedResults);
                });

                test(`if username already in use, user should NOT be allowed to join in`, async () => {
                    const response = await request(app).get(
                        `/validateUser?email=callie.madison.par@gmail.com&username=callie&room=javascript`
                    );

                    const expectedResults = { result: { isAllowed: false, duplicateFields: ['username'] } };

                    expect(response.status).toEqual(200);
                    expect(response.body).toEqual(expectedResults);
                });

                test(`if both email and username are in use, user should NOT be allowed to join in`, async () => {
                    const response = await request(app).get(
                        `/validateUser?email=john.par@gmail.com&username=john&room=css`
                    );

                    const expectedResults = { result: { isAllowed: false, duplicateFields: ['email', 'username'] } };

                    expect(response.status).toEqual(200);
                    expect(response.body).toEqual(expectedResults);
                });
            });
        });
    });

    describe('/getActiveRooms route', () => {
        describe('invalid responses', () => {
            test('if error is encountered, should return HTTP 500', async () => {
                const getActiveRoomsMock = jest.spyOn(RoomModel, 'getActiveRooms');
                getActiveRoomsMock.mockImplementationOnce(() => {
                    throw new Error('Integration test: Something went wrong');
                });

                const response = await request(app).get(`/getActiveRooms`);

                expect(response.status).toEqual(500);
            });
        });

        describe('valid responses', () => {
            test(`if there are no active rooms, should return empty array`, async () => {
                await RoomModel.deleteMany();

                const response = await request(app).get(`/getActiveRooms`);

                expect(response.status).toEqual(200);
                expect(response.body.rooms).toEqual([]);
            });

            test(`if there are active rooms, should return array of room names`, async () => {
                const expectedResults = ['javascript', 'css', 'html'];
                const response = await request(app).get(`/getActiveRooms`);

                expect(response.status).toEqual(200);
                expect(response.body.rooms).toEqual(expectedResults);
            });
        });
    });
});
