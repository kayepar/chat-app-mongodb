const RoomModel = require('../../../../models/room');
const room_controller = require('../../../../controller/room-controller');
jest.mock('../../../../error/CustomError');

const mockRequest = (queryData) => ({
    query: queryData,
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);

    return res;
};

const mockNext = () => {
    const next = jest.fn();
    return next;
};

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.resetAllMocks();
});

describe('unit tests for rooms-controller', () => {
    describe('/validateUser route', () => {
        let getChatRoomMock;

        beforeEach(() => {
            getChatRoomMock = jest.spyOn(room_controller, 'getChatRoom');
        });

        describe('invalid responses', () => {
            test('if room parameter is missing, should call error middleware (with 400 status)', async () => {
                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
                expect(getChatRoomMock).not.toHaveBeenCalled();
            });

            test('if email parameter is missing, should call error middleware (with 400 status)', async () => {
                const req = mockRequest({ username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
                expect(getChatRoomMock).not.toHaveBeenCalled();
            });

            test('if username parameter is missing, should call error middleware (with 400 status)', async () => {
                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
                expect(getChatRoomMock).not.toHaveBeenCalled();
            });

            test('if any other issue is encountered, should call error middleware (with 500 status)', async () => {
                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                const getChatRoomMock = jest.spyOn(room_controller, 'getChatRoom');
                getChatRoomMock.mockImplementationOnce(() => {
                    throw new Error('Mock Error');
                });

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 500 }));
                expect(getChatRoomMock).toHaveBeenCalled();
            });
        });

        let checkUserAccessMock;

        describe('valid responses', () => {
            beforeEach(() => {
                checkUserAccessMock = jest.spyOn(room_controller, 'checkUserAccess');
            });

            test('if room is not existing, isAllowed is true with empty duplicateFields', async () => {
                getChatRoomMock.mockReturnValue(null);

                const testResult = {
                    result: { isAllowed: true, duplicateFields: [] },
                };

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
                expect(getChatRoomMock).toHaveBeenCalled();
            });

            test('if room is existing and user is valid, isAllowed is true with empty duplicateFields', async () => {
                getChatRoomMock.mockReturnValue({ _id: '6043163766eb61058c06d3f2', name: 'javascript', __v: 0 });
                checkUserAccessMock.mockReturnValue({ isAllowed: true, duplicateFields: [] });

                const testResult = {
                    result: { isAllowed: true, duplicateFields: [] },
                };

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
                expect(getChatRoomMock).toHaveBeenCalled();
                expect(checkUserAccessMock).toHaveBeenCalled();
            });

            test(`if room is existing and email already in use, isAllowed should be false and duplicateFields to contain 'email'`, async () => {
                getChatRoomMock.mockReturnValue({ _id: '6043163766eb61058c06d3f2', name: 'javascript', __v: 0 });
                checkUserAccessMock.mockReturnValue({ isAllowed: false, duplicateFields: ['email'] });

                const testResult = {
                    result: { isAllowed: false, duplicateFields: ['email'] },
                };

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
                expect(getChatRoomMock).toHaveBeenCalled();
                expect(checkUserAccessMock).toHaveBeenCalled();
            });

            test(`if room is existing and username already in use, isAllowed should be false and duplicateFields to contain 'username'`, async () => {
                getChatRoomMock.mockReturnValue({ _id: '6043163766eb61058c06d3f2', name: 'javascript', __v: 0 });
                checkUserAccessMock.mockReturnValue({ isAllowed: false, duplicateFields: ['username'] });

                const testResult = {
                    result: { isAllowed: false, duplicateFields: ['username'] },
                };

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
                expect(getChatRoomMock).toHaveBeenCalled();
                expect(checkUserAccessMock).toHaveBeenCalled();
            });

            test(`if room is existing and both email and username are in use, isAllowed should be false and duplicateFields to contain 'email' and 'username'`, async () => {
                getChatRoomMock.mockReturnValue({ _id: '6043163766eb61058c06d3f2', name: 'javascript', __v: 0 });
                checkUserAccessMock.mockReturnValue({ isAllowed: false, duplicateFields: ['email', 'username'] });

                const testResult = {
                    result: { isAllowed: false, duplicateFields: ['email', 'username'] },
                };

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
                expect(getChatRoomMock).toHaveBeenCalled();
                expect(checkUserAccessMock).toHaveBeenCalled();
            });
        });
    });

    describe('/getActiveRooms route', () => {
        let getActiveRoomsMock;

        beforeEach(() => {
            getActiveRoomsMock = jest.spyOn(RoomModel, 'getActiveRooms');
        });

        describe('valid responses', () => {
            test(`if there are no active rooms, should return HTTP 200 and empty 'rooms' array`, async () => {
                getActiveRoomsMock.mockReturnValue([]);

                const testRooms = { rooms: [] };

                const req = mockRequest();
                const res = mockResponse();
                const next = mockNext();

                await room_controller.getActiveRooms(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testRooms);
                expect(getActiveRoomsMock).toHaveBeenCalled();
            });

            test(`if there are active rooms, should return HTTP 200 and 'rooms' array with existing room names`, async () => {
                getActiveRoomsMock.mockReturnValue(['javascript', 'python']);

                const testRooms = { rooms: ['javascript', 'python'] };

                const req = mockRequest();
                const res = mockResponse();
                const next = mockNext();

                await room_controller.getActiveRooms(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testRooms);
                expect(getActiveRoomsMock).toHaveBeenCalled();
            });
        });

        describe('invalid responses', () => {
            test('if error is encountered, should call error middleware', async () => {
                getActiveRoomsMock.mockImplementationOnce(() => {
                    throw new Error('Something went wrong');
                });

                const req = mockRequest();
                const res = mockResponse();
                const next = mockNext();

                await room_controller.getActiveRooms(req, res, next);

                expect(getActiveRoomsMock).toHaveBeenCalled();
                expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Something went wrong' }));
            });
        });
    });
});
