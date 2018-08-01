const userRouter = require('./user.router');

module.exports = function (path, app) {
    userRouter(path, app);
};
