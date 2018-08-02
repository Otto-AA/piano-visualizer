const userRouter = require('./user.router');
const { unexpectedError } = require('./Response');

function errorHandler(err, req, res, next) {
    if (!req.xhr) {
        console.log('req.xhr');
        return next(err);
    }

    console.error('Unexpected error', err);
    return res.status(500).send(unexpectedError);
}

module.exports = function (path, app) {
    app.use(errorHandler);
    userRouter(path, app);
};
