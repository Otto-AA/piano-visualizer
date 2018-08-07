const { Router } = require('express');
const userRouter = require('./user.router');
const visualizationRouter = require('./visualization.router');
const { unexpectedError } = require('./Response');
const { apiLogger } = require('../config/logger');

function errorHandler(err, req, res, next) {
    if (!req.xhr) {
        return next(err);
    }

    apiLogger.error(`Unexpected error for ${req.method} ${req.path}`, err, req);
    return res.status(500).send(unexpectedError);
}

function apiRequestLogger(req, res, next) {
    apiLogger.verbose(`${req.method} ${req.path}`);

    return next(req);
}

const apiRouter = Router();

apiRouter.use(errorHandler);
apiRouter.use(userRouter);
apiRouter.use(visualizationRouter);

module.exports = apiRouter;

// module.exports = function (path, app) {
//     apiLogger.silly('Adding API routes to app');
//     app.use(errorHandler);
//     // TODO: Check if inversion is necessary
//     app.use(path, userRouter);
//     app.use(path, visualizationRouter);
// };
