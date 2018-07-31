const bodyParser = require("body-parser");
const userRouter = require('./user.router');
const { } = require('../db/db');

module.exports = function (path, app) {

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    userRouter(path, app);
};