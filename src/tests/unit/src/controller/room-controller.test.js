jest.mock('../../../../error/CustomError');

// jest.mock('../../../../error/CustomError', function () {
//     return this;
// });

const { validateUser, getActiveRooms } = require('../../../../controller/room-controller');
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

                await validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
            });

            test('should throw error 400 if email parameter is missing', async () => {
                const req = mockRequest({ username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext;

                await validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
            });

            test('should throw error 400 if username parameter is missing', async () => {
                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext;

                await validateUser(req, res, next);

                expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
            });
        });

        describe('valid responses', () => {
            test('if room is not existing, should return HTTP 200 and isAllowed to true', () => {
                // todo: try mockingoose - mock find() itseld and not getChatRoom function
                const getChatRoom = jest.fn().mockReturnValue(null);

                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye', room: 'javascript' });
                const res = mockResponse();
                const next = mockNext;

                const testResult = {
                    isAllowed: true,
                    duplicateFields: [],
                };

                validateUser(req, res, next);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(testResult);
            });
        });
    });

    // describe('/getActiveRooms route', () => {});
});
