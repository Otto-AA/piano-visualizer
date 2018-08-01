const session = require('express-session');

let options;
if (process.env.NODE_ENV === 'development') {
    options = {
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: false,
            maxAge: 60 * 60 * 1000
        }
    };
}
else {
    options = {
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: {
            secure: true,
            httpOnly: true,
            domain: process.env.domain,
            maxAge: 60 * 60 * 1000
        }
    };
}

module.exports = function (app) {
    app.use(session(options));
}