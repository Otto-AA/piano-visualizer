const mongoose = require('mongoose');

const signupVerificationSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, {
        strict: 'throw'
    });

signupVerificationSchema.virtual('verification_id')
    .set(function (id) {
        this._id = id;
    })
    .get(function () {
        return this._id;
    });

const SignupVerification = mongoose.model('SignupVerification', signupVerificationSchema);

module.exports = SignupVerification;