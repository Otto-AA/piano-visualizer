const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../db/models/User');
const { apiLogger } = require('../config/logger');

// passport.js
module.exports = function (app) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function (email, password, done) {
        apiLogger.silly('validating via passportjs');
        User.validateCredentials({ email, password })
            .then(user => done(null, user))
            .catch(err => {
                if (err.message === 'Invalid credentials') {
                    apiLogger.silly('passportjs invalid credentials error');
                    return done(null, false, { message: err.message });
                }

                return done(err);
            });
    })
    );

    passport.serializeUser(function (user, done) {
        done(null, user.user_id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });


    app.use(passport.initialize());
    app.use(passport.session());
};