const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../db/models/User');

// passport.js
module.exports = function (app) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function (email, password, done) {
        User.validateCredentials(email, password)
            .then(user => done(null, user))
            .catch(err => done(null, false, { message: err.message }));
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