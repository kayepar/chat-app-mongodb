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

                // console.log(response);
                const user = await UserModel.find({ username: 'kaye' });
                console.log(user);

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
        });
    });
});
