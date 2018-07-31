function ErrorResponse({ code, message, detail = {} }) {
    if (typeof code !== 'number') {
        throw new Error('Invalid error code');
    }
    if (typeof message !== 'string') {
        throw new Error('Invalid error message');
    }
    if (typeof detail !== 'object') {
        throw new Error('Invalid error detail')
    }

    return {
        code,
        message,
        detail
    }
}

const unexpectedError = ErrorResponse({
    code: 500,
    message: 'Unexpected error'
});
const loginRequiredError = ErrorResponse({
    code: 403,
    message: 'login required'
});
const notFoundError = ErrorResponse({
    code: 404,
    message: 'Requested resource was not found'
});

module.exports = {
    ErrorResponse,
    unexpectedError,
    loginRequiredError,
    notFoundError
};