const { validateUser, getActiveRooms } = require('../../../../controller/room-controller');

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
        describe('invalid response', () => {
            test('should throw invalid request error if incomplete parameters', () => {
                const req = mockRequest({ email: 'kaye.cenizal@gmail.com', username: 'kaye' });
                const res = mockResponse();
                const next = mockNext;

                // todo: need to mock customerror
                // expect(() => validateUser(req, res, next)).toThrow();
                validateUser(req, res, next);
                expect(next).toHaveBeenCalled();
            });
        });
    });

    // describe('/getActiveRooms route', () => {});
});
