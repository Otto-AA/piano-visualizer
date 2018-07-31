const express = require('express')
const uuidv1 = require('uuid/v1');
const User = require('../db/models/User');
const SignupVerification = require('../db/models/SignupVerification');
const { SuccessResponse, Response, unexpectedError, loginRequiredError, notFoundError } = require('./Response');

const router = express.Router();


router.get('/', (req, res) => {
    res.send('Cookie party!');
});

router.post('/signup', (req, res) => {
    const { user_name, email, password } = req.body;
    const verification_id = uuidv1();
    const verification = new SignupVerification({
        verification_id,
        user_name,
        email,
        password
    });

    // Save verification to database
    verification.save()
        .then(val => res.send(SuccessResponse({ data: { verification_id } })))
        .catch(err => {
            // MongoDB duplicate key error
            if (err.code === 11000) {
                return res.status(409)
                    .send(Response({
                        code: 409,
                        message: 'User already existing',
                    }));
            }
            if (err.name === 'ValidationError') {
                return res.status(400)
                    .send(Response({
                        code: 400,
                        message: 'Invalid arguments',
                        detail: err
                    }));
            }

            console.error('Unexpected error', new Error(err));
            return res.status(500)
                .send(unexpectedError);
        });
});

router.post('/verify_signup', async (req, res) => {
    const { verification_id } = req.body;

    try {
        const userData = await SignupVerification.findById(verification_id).exec();

        if (!userData) {
            return res.status(400)
                .send(Response({
                    code: 400,
                    message: 'Invalid verification_id'
                }));
        }

        const user = new User({
            user_name: userData.user_name,
            email: userData.email,
            password: userData.password
        });

        try {
            await user.save();
            // verification is deleted asynchronously as it isn't important to succeed
            SignupVerification.findByIdAndRemove(verification_id).exec();
            return res.status(200).send(SuccessResponse({ data: { user } }));
        }
        catch (err) {
            // MongoDB duplicate key error
            if (err.code === 11000) {
                return res.status(409)
                    .send(Response({
                        code: 409,
                        message: 'User with the same id/email already existing',
                    }));
            }

            throw err;
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500)
            .send(unexpectedError);
    }
    
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    User.validateCredentials(email, password)
        .then(user => {
            res.send(SuccessResponse({ data: { user } }));
        })
        .catch(err => res.status(403).send(err));
});

router.delete('/user', async (req, res) => {
    const { user_id } = req.query;

    User.findByIdAndRemove(user_id, (err, user) => {
        if (err) {
            return res.status(500)
                .send(unexpectedError);
        }
        if (!user) {
            return res.status(404).send('no user found');
        }

        return res.status(200).send(SuccessResponse());
    });
});

router.get('/user', function (req, res) {
    const { user_id } = req.query;
    User.findById(user_id, (err, user) => {
        if (err) {
            return res.status(500)
                .send(unexpectedError);
        }
        if (!user) {
            return res.status(404)
                .send(notFoundError);
        }

        // Only send user_id and user_name. For more details, more authorization is needed.
        user = {
            user_id: user.user_id,
            user_name: user.user_name
        };
        
        return res.status(200).send(SuccessResponse({ data: { user } }));
    });
});

module.exports = function (path, app) {
    app.use(path, router);
};
