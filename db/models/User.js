const mongoose = require('mongoose');
const password_encryption = require('../../lib/password_encryption');
const { api: logger } = require('../../config/logger');

// User
//
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        alias: 'user_id'
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

// Set _id by user_name
userSchema.path('user_name').set(function (user_name) {
    this._id = userNameToId(user_name);
    return user_name;
});

// Encrypt password
userSchema.path('password').set(password_encryption.encrypt);
userSchema.virtual('user_id').get(function () { return this._id; });

if (!userSchema.options.toObject) userSchema.options.toObject = {};
userSchema.options.toObject.transform = function (doc, ret, options) {
    delete ret.password;
    ret.user_id = ret._id;
    delete ret._id;
    return ret;
}


// Static functions
//
userSchema.statics.validateCredentials = function ({ email, password }) {
    return new Promise((resolve, reject) => {
        this.findOne({ email }, (err, user) => {
            if (err) {
                logger.silly('Unexpected error while validating credentials');
                return reject(new Error('Error while validating credentials'));
            }
            if (!user) {
                logger.silly('invalid email address');
                return reject(new Error('Invalid credentials'));
            }

            if (password_encryption.comparePasswords(password, user.password)) {
                logger.silly('invalid password');
                return resolve(user);
            }

            return reject(new Error('Invalid credentials'));
        });
    });
};
userSchema.statics.userNameToId = userNameToId;

function userNameToId(user_name) {
    return user_name.toLowerCase().replace(/[^\w]/g, '');
}


const User = mongoose.model('User', userSchema);

module.exports = User;
