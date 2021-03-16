const request = require('supertest');
const app = require('../../app');
const { configureDb } = require('./fixtures/db');
const RoomModel = require('../../models/room');
const UserModel = require('../../models/user');

beforeEach(configureDb);

// afterAll(() => {
//     jest.resetAllMocks();
// });

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
        });

        describe('valid responses', () => {
            test('if room is not existing, isAllowed is true with empty duplicateFields', async () => {
                const response = await request(app).get(
                    `/validateUser?email=chatuser1@example.com&username=chatuser1&room=testroom`
                );

                const expectedResults = { result: { isAllowed: true, duplicateFields: [] } };

                expect(response.body).toEqual(expectedResults);
            });

            test('if room is existing and user is valid, isAllowed is true with empty duplicateFields', async () => {
                const response = await request(app).get(
                    `/validateUser?email=chatuser1@example.com&username=chatuser1&room=html`
                );

                const expectedResults = { result: { isAllowed: true, duplicateFields: [] } };

                expect(response.body).toEqual(expectedResults);
            });

            test(`if room is existing and email already in use, isAllowed should be false and duplicateFields to contain 'email'`, async () => {
                const response = await request(app).get(
                    `/validateUser?email=kaye.cenizal@gmail.com&username=kcenizal&room=javascript`
                );

                const expectedResults = { result: { isAllowed: false, duplicateFields: ['email'] } };

                expect(response.body).toEqual(expectedResults);
            });

            test(`if room is existing and username already in use, isAllowed should be false and duplicateFields to contain 'username'`, async () => {
                const response = await request(app).get(
                    `/validateUser?email=callie.madison.par@gmail.com&username=callie&room=javascript`
                );

                const expectedResults = { result: { isAllowed: false, duplicateFields: ['username'] } };

                expect(response.body).toEqual(expectedResults);
            });

            test(`if room is existing and both email and username are in use, isAllowed should be false and duplicateFields to contain 'email' and 'username'`, async () => {
                const response = await request(app).get(
                    `/validateUser?email=john.par@gmail.com&username=john&room=css`
                );

                const expectedResults = { result: { isAllowed: false, duplicateFields: ['email', 'username'] } };

                expect(response.body).toEqual(expectedResults);
            });
        });
    });
});
