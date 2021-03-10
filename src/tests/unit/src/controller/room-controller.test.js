jest.mock('../../../../error/CustomError');

// jest.mock('../../../../models/room', () => ({
//     isUserAllowedToJoin: jest.fn(),
// }));
// jest.mock('../../../../error/CustomError', function () {
//     return this;
// });

// const RoomModel = require('../../../../models/room');
// const isUserAllowedToJoin = require('../../../../models/room').isUserAllowedToJoin;
const room_controller = require('../../../../controller/room-controller');
const CustomError = require('../../../../error/CustomError');

const mockRequest = (queryData) => ({
    query: queryData,
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);

    return res;
};

const mockNext = jest.fn();

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.resetAllMocks();
});

describe('tests for rooms-controller - mocked request and response', () => {
    describe('/validateUser route', () => {
        describe('invalid responses', () => {
            beforeAll(() => {
                CustomError.mockImplementation(() => {
                    return {
                        name: 'CustomError',
                        status: 400,
                        message: 'Invalid request',
                        cause: 'Incomplete user details',
                    };
                });
            });

            afterAll(() => {
                jest.resetAllMocks();
            });

            test('should throw error 400 if room parameter is missing', async () => {
                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye' });
                const res = mockResponse();
                const next = mockNext;

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
            });

            test('should throw error 400 if email parameter is missing', async () => {
                const req = mockRequest({ username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext;

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
            });

            test('should throw error 400 if username parameter is missing', async () => {
                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext;

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
            });
        });

        let getChatRoomMock;
        let checkUserAccessMock;

        describe('valid responses', () => {
            beforeEach(() => {
                getChatRoomMock = jest.spyOn(room_controller, 'getChatRoom');
                checkUserAccessMock = jest.spyOn(room_controller, 'checkUserAccess');
            });

            test('if room is not existing, should return HTTP 200, isAllowed should be true and duplicateFields empty', async () => {
                getChatRoomMock.mockReturnValue(null);

                const testResult = {
                    result: { isAllowed: true, duplicateFields: [] },
                };

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext;

                await room_controller.validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
                expect(getChatRoomMock).toHaveBeenCalled();
            });

            test('if room existing but user is valid, should return HTTP 200, isAllowed should be true and duplicateFields empty', async () => {
                getChatRoomMock.mockReturnValue({ _id: '6043163766eb61058c06d3f2', name: 'javascript', __v: 0 });
                checkUserAccessMock.mockReturnValue({ isAllowed: true, duplicateFields: [] });

                const testResult = {
                    result: { isAllowed: true, duplicateFields: [] },
                };

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext;

                await room_controller.validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
                expect(getChatRoomMock).toHaveBeenCalled();
                expect(checkUserAccessMock).toHaveBeenCalled();
            });

            test(`if room existing but email already in use, should return HTTP 200, isAllowed should be false and duplicateFields to be [ 'email' ]`, async () => {
                getChatRoomMock.mockReturnValue({ _id: '6043163766eb61058c06d3f2', name: 'javascript', __v: 0 });
                checkUserAccessMock.mockReturnValue({ isAllowed: false, duplicateFields: ['email'] });

                const testResult = {
                    result: { isAllowed: false, duplicateFields: ['email'] },
                };

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext;

                await room_controller.validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
                expect(getChatRoomMock).toHaveBeenCalled();
                expect(checkUserAccessMock).toHaveBeenCalled();
            });

            test(`if room existing but username already in use, should return HTTP 200, isAllowed should be false and duplicateFields to be [ 'username' ]`, async () => {
                getChatRoomMock.mockReturnValue({ _id: '6043163766eb61058c06d3f2', name: 'javascript', __v: 0 });
                checkUserAccessMock.mockReturnValue({ isAllowed: false, duplicateFields: ['username'] });

                const testResult = {
                    result: { isAllowed: false, duplicateFields: ['username'] },
                };

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext;

                await room_controller.validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
                expect(getChatRoomMock).toHaveBeenCalled();
                expect(checkUserAccessMock).toHaveBeenCalled();
            });

            test(`if room existing but both email and username already in use, should return HTTP 200, isAllowed should be false and duplicateFields to be [ 'email', 'username' ]`, async () => {
                getChatRoomMock.mockReturnValue({ _id: '6043163766eb61058c06d3f2', name: 'javascript', __v: 0 });
                checkUserAccessMock.mockReturnValue({ isAllowed: false, duplicateFields: ['email', 'username'] });

                const testResult = {
                    result: { isAllowed: false, duplicateFields: ['email', 'username'] },
                };

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext;

                await room_controller.validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
                expect(getChatRoomMock).toHaveBeenCalled();
                expect(checkUserAccessMock).toHaveBeenCalled();
            });
        });
    });

    // describe('/getActiveRooms route', () => {});
});
