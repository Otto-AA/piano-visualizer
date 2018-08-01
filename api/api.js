const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRouter = require('./user.router');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../db/models/User');

// passport.js
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function (email, password, done) {
    User.validateCredentials(email, password)
        .then(user => done(null, user))
        .catch(err => done(null, false, { message: err.message }));
})
);
passport.serializeUser(function(user, done) {
    done(null, user.user_id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

module.exports = function (path, app) {

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(passport.session());
    userRouter(path, app);
};
