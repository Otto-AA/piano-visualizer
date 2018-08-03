const userRouter = require('./user.router');
const { unexpectedError } = require('./Response');
const { app: logger } = require('../config/logger');

function errorHandler(err, req, res, next) {
    if (!req.xhr) {
        return next(err);
    }
    console.log('Unexpected error', err);
    logger.error('Unexpected error', err);
    return res.status(500).send(unexpectedError);
}

function apiRequestLogger(req, res, next) {
    logger.verbose(`${req.method} ${req.path}`);

    return next(req);
}

module.exports = function (path, app) {
    logger.silly('Adding API routes to app');
    app.use(errorHandler);
    // app.use(`${path}/*`, apiRequestLogger);
    userRouter(path, app);
};
