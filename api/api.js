const userRouter = require('./user.router');
const { unexpectedError } = require('./Response');
const { apiLogger } = require('../config/logger');

function errorHandler(err, req, res, next) {
    if (!req.xhr) {
        return next(err);
    }

    apiLogger.error('Unexpected error', err);
    return res.status(500).send(unexpectedError);
}

function apiRequestLogger(req, res, next) {
    apiLogger.verbose(`${req.method} ${req.path}`);

    return next(req);
}

module.exports = function (path, app) {
    apiLogger.silly('Adding API routes to app');
    app.use(errorHandler);
    userRouter(path, app);
};
