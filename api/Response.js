// Templates for api responses
//

function Response({ code = 500, message = '', data = {} } = {}) {
    if (typeof code !== 'number' || 100 > code || code >= 600) {
        throw new Error('Invalid response code');
    }
    if (typeof message !== 'string') {
        throw new Error('Invalid response message');
    }
    if (typeof data !== 'object') {
        throw new Error('Invalid response data');
    }

    return {
        code,
        message,
        data
    }
}

function SuccessResponse({ code = 200, data = {} } = {}) {
    return Response({ code, message: 'success', data });
};

const unexpectedError = Response({
    code: 500,
    message: 'Unexpected error'
});
const loginRequiredError = Response({
    code: 403,
    message: 'login required'
});
const notFoundError = Response({
    code: 404,
    message: 'Requested resource was not found'
});

module.exports = {
    SuccessResponse,
    Response,
    unexpectedError,
    loginRequiredError,
    notFoundError
};
