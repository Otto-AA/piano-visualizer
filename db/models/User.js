const mongoose = require('mongoose');
const password_encryption = require('../../lib/password_encryption');

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

schema.set('toObject', {
    getters: true,
    transform: function(...args) {
        console.log('Calling toJSON transform', [...args]);
    }
});


// Static functions
//
userSchema.statics.validateCredentials = function (email, password) {
    return new Promise((resolve, reject) => {
        this.findOne({ email }, (err, user) => {
            if (err || !user) {
                return reject('invalid email');
            }

            if (password_encryption.comparePasswords(password, user.password)) {
                return resolve(user);
            }

            return reject('Invalid password');
        });
    });
};

userSchema.statics.findById = function (user_id) {
    return this.findById

function userNameToId(user_name) {
    return user_name.toLowerCase().replace(/[^\w]/g, '');
}


const User = mongoose.model('User', userSchema);

module.exports = User;
