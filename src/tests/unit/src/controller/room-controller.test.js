const RoomModel = require('../../../../models/room');
const room_controller = require('../../../../controller/room-controller');

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

let getChatRoomMock;

beforeEach(() => {
    getChatRoomMock = jest.spyOn(room_controller, 'getChatRoom');
});

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.resetAllMocks();
});

describe('tests for rooms-controller - mocked request and response', () => {
    describe('/validateUser route', () => {
        describe('invalid responses', () => {
            test('should call error middleware (with HTTP 400) if room parameter is missing', async () => {
                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
                expect(getChatRoomMock).not.toHaveBeenCalled();
            });

            test('should call error middleware (with HTTP 400) if email parameter is missing', async () => {
                const req = mockRequest({ username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
                expect(getChatRoomMock).not.toHaveBeenCalled();
            });

            test('should call error middleware (with HTTP 400) if username parameter is missing', async () => {
                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
                expect(getChatRoomMock).not.toHaveBeenCalled();
            });

            test('should call error middleware (with HTTP 500) if any other issue is encountered', async () => {
                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext();

                const getChatRoomMock = jest.spyOn(room_controller, 'getChatRoom');
                getChatRoomMock.mockImplementationOnce(() => {
                    throw new Error('Mock Error');
                });

                await room_controller.validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 500 }));
                expect(getChatRoomMock).not.toHaveBeenCalled();
            });
        });

        let checkUserAccessMock;

        describe('valid responses', () => {
            beforeEach(() => {
                checkUserAccessMock = jest.spyOn(room_controller, 'checkUserAccess');
            });

            test('if room is not existing, should return HTTP 200, isAllowed should be true and duplicateFields empty', async () => {
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

            test('if room is existing and user is valid, should return HTTP 200, isAllowed should be true and duplicateFields empty', async () => {
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

            test(`if room is existing and email already in use, should return HTTP 200, isAllowed should be false and duplicateFields to be [ 'email' ]`, async () => {
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

            test(`if room is existing and username already in use, should return HTTP 200, isAllowed should be false and duplicateFields to be [ 'username' ]`, async () => {
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

            test(`if room is existing and both email and username are in use, should return HTTP 200, isAllowed should be false and duplicateFields to be [ 'email', 'username' ]`, async () => {
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
        describe('valid responses', () => {
            test(`Should return HTTP 200 and empty 'rooms' array if there are no active rooms`, async () => {
                const getActiveRoomsMock = jest.spyOn(RoomModel, 'getActiveRooms');
                getActiveRoomsMock.mockImplementationOnce(() => {
                    return [];
                });

                const testRooms = { rooms: [] };

                const req = mockRequest();
                const res = mockResponse();
                const next = mockNext();

                await room_controller.getActiveRooms(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testRooms);
                expect(getActiveRoomsMock).toHaveBeenCalled();
            });

            test(`Should return HTTP 200 and 'rooms' array with existing room names`, async () => {
                const getActiveRoomsMock = jest.spyOn(RoomModel, 'getActiveRooms');
                getActiveRoomsMock.mockImplementationOnce(() => {
                    return ['javascript', 'python'];
                });

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
            test('Should call error middleware on thrown errors', async () => {
                const getActiveRoomsMock = jest.spyOn(RoomModel, 'getActiveRooms');
                getActiveRoomsMock.mockImplementationOnce(() => {
                    throw new Error('Something went wrong');
                });

                const req = mockRequest();
                const res = mockResponse();
                const next = mockNext();

                await room_controller.getActiveRooms(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Something went wrong' }));
            });
        });
    });
});
