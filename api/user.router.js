const { Router } = require('express')
const uuidv1 = require('uuid/v1');
const User = require('../db/models/User');
const SignupVerification = require('../db/models/SignupVerification');
const { SuccessResponse, Response, unexpectedError, invalidCredentialsError, loginRequiredError, invalidArgumentsError, notFoundError } = require('./Response');
const passport = require('passport');
const { api: logger } = require('../config/logger');

const router = Router();


function isAuthenticated(req, res, next) {
    logger.silly('checking authentication');
    if (req.isAuthenticated()) {
        logger.silly('user is authenticated');
        return next();
    }

    logger.verbose('user authentication failed');
    return res.status(401)
        .send(loginRequiredError);
}

router.get('/', (req, res) => {
    res.send('Cookie party!');
});

router.post('/signup', async (req, res, next) => {
    const { user_name, email, password } = req.body;

    // TODO: Update errorOccurred functionality
    logger.silly('checking if email/user_name is already in use before signup');
    let errorOccurred = true;
    await User.findOne({
        $or: [{ user_name }, { email }]
    }, (err, user) => {
        if (err) {
            throw err;
        }
        if (user) {
            logger.verbose('signup failed due to 409 conflict');
            return res.status(409)
                .send(Response({ code: 409, message: 'username or email already in use' }));
        }
        errorOccurred = false;
    });
    if (errorOccurred) {
        logger.verbose('signup error occurred');
        return;
    }
    const verification_id = uuidv1();
    const verification = new SignupVerification({
        verification_id,
        user_name,
        email,
        password
    });

    // Save verification to database
    logger.silly('saving verification id to database');
    verification.save()
        .then(val => {
            logger.silly('successfully saved verification id');
            res.send(SuccessResponse({ data: { verification_id } }))
        })
        .catch(err => {
            // MongoDB duplicate key error
            if (err.code === 11000) {
                logger.verbose('verification failed due to 409 conflict');
                return res.status(409)
                    .send(Response({
                        code: 409,
                        message: 'User already existing',
                    }));
            }
            if (err.name === 'ValidationError') {
                logger.verbose('verification failed due to validation error');
                return res.status(400)
                    .send(Response({
                        code: 400,
                        message: 'Invalid arguments',
                        detail: err
                    }));
            }

            throw err;
        });
});

router.post('/verify_signup', async (req, res) => {
    const { verification_id } = req.body;

    logger.silly('getting user data associated with verification_id');
    const userData = await SignupVerification.findById(verification_id).exec();

    if (!userData) {
        logger.verbose('returning 400 as no verification_id was found');
        return res.status(400)
            .send(Response({
                code: 400,
                message: 'Invalid verification_id'
            }));
    }

    logger.silly('creating new user based on user data');
    const user = new User({
        user_name: userData.user_name,
        email: userData.email,
        password: userData.password
    });

    try {
        logger.silly('saving verified user to database');
        await user.save();
        // verification is deleted asynchronously as it isn't important to succeed
        logger.silly('removing verification id from database')
        SignupVerification.findByIdAndRemove(verification_id).exec();
        return res.status(200).send(SuccessResponse({ data: { user } }));
    }
    catch (err) {
        // MongoDB duplicate key error
        if (err.code === 11000) {
            logger.verbose('returning 409 because user with same id/email already exists');
            return res.status(409)
                .send(Response({
                    code: 409,
                    message: 'User with the same id/email already existing',
                }));
        }

        throw err;
    }
});

router.post('/login', passport.authenticate('local', { failWithError: true }),
    function (req, res, next) {
        logger.silly('successul login');
        // Successful login
        const user = req.user;

        return res.status(200)
            .send(Response({ data: { user } }));
    },
    function (err, req, res, next) {
        logger.verbose('login failed', err);
        // Login error
        return res.status(401)
            .send(invalidCredentialsError);
    }
);

router.post('/logout', function (req, res) {
    logger.silly('logging out');
    req.logout();
    return res.status(200)
        .send(SuccessResponse());
});

router.get('/current_user', isAuthenticated, function (req, res, next) {
    logger.silly('getting current user');
    const user = req.user;
    return res.status(200)
        .send(SuccessResponse({ data: { user } }));
});


router.delete('/user', async (req, res) => {
    const { email, password } = req.query;

    // Require credentials
    logger.silly('validating credentials before deleting user');
    try {
        await User.validateCredentials({ email, password });
    }
    catch (err) {
        if (err.message === 'Invalid credentials') {
            logger.verbose('invalid credentials for deleting user');
            return res.status(401).send(invalidCredentialsError);
        }

        throw err;
    }

    await User.findOneAndRemove({ email }, (err, user) => {
        if (err) {
            throw err;
        }
        logger.verbose('deleted user');
        return res.status(200).send(SuccessResponse());
    });
});

router.get('/user', function (req, res) {
    const { user_id } = req.query;
    User.findById(user_id, (err, user) => {
        if (err) {
            throw err;
        }
        if (!user) {
            logger.silly('user not found');
            return res.status(404)
                .send(notFoundError);
        }

        // Only send user_id and user_name. For more details, more authorization is needed.
        user = {
            user_id: user.user_id,
            user_name: user.user_name
        };
        logger.silly('returning user');
        return res.status(200).send(SuccessResponse({ data: { user } }));
    });
});

module.exports = function (path, app) {
    app.use(path, router);
};
