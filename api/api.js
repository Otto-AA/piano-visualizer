const express = require('express')
const bodyParser = require("body-parser");
const uuidv1 = require('uuid/v1');
const { User, SignupVerification } = require('../db/db');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());


router.get('/', (req, res) => {
    res.send('Cookie party!');
});

router.post('/signup', (req, res) => {
    // TODO: Better error handling
    // TODO: Check if user_id/email already exists
    // TODO: Better response
    console.log(req.body);
    const verification_id = uuidv1();
    const verification = new SignupVerification({
        verification_id,
        user_name: req.body.user_name,
        email: req.body.email,
        password: req.body.password
    });
    verification.save()
        .then(val => res.send(verification_id))
        .catch(err => res.status(400).send(err));
});

router.post('/verify_user', async (req, res) => {
    // TODO: Better error handling
    // TODO: Check for success before removing verification id
    // TODO: Better response
    const verification_id = req.body.verification_id;
    // SignupVerification.findById(verification_id)
    const userData = await SignupVerification.findByIdAndRemove(verification_id).exec();
    const user = new User({
        user_name: userData.user_name,
        email: userData.email,
        password: userData.password
    });

    user.save()
        .then((user) => res.send(user));
    
})

router.get('/user/:user_id')

module.exports = router;

/**
 * API Endpoints
 * 
 * POST create_user
 * > user_name
 * > email
 * > password
 * < verification_id
 * 
 * POST verify_user
 * > verification_id
 * < user_id
 * 
 * DELETE delete_user
 * > user_id
 * > password
 * 
 * POST login
 * > user_name
 * > password
 * < user_id
 * 
 * POST logout
 * 
 * GET user/{user_id}/info
 * GET user/{user_id}/songs
 * GET user/{user_id}/song/{song_id}
 * 
 */