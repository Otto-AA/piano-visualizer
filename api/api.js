const bodyParser = require("body-parser");
const userRouter = require('./user.router');

module.exports = function (path, app) {

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    userRouter(path, app);
};
