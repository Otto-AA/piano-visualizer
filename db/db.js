const mongodb = require('mongodb');
const mongoose = require('mongoose');
const collections = require('./db_collections');

const mongo_url = process.env.MONGO_URL;
mongoose.connect(mongo_url, (err) => {
    if (err) {
        console.error('Error while connecting to database');
        throw err;
    }
});


// User
//
const userSchema = new mongoose.Schema({
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

userSchema.statics.userNameToId = userNameToId;

// Automatically set id by user_name
userSchema.path('user_name').set(function (user_name) {
    this._id = userNameToId(user_name);
    return user_name;
});


const User = mongoose.model('User', userSchema);

function userNameToId(user_name) {
    let user_id = user_name.toLowerCase();
    user_id = user_id.replace(/[^\w]/g, '');
    return user_id;
}


// Verification
//
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

User.find()
    .then(res => {
        console.group('Users');
        console.log(res);
        console.groupEnd();
    });
SignupVerification.find()
    .then(res => {
        console.group('SignupVerifications');
        console.log(res);
        console.groupEnd();
    });

module.exports = {
    User,
    SignupVerification
};

/**
 * Database structure
 * 
 * users: {
 *   user_id: {
 *     user_name: string
 *     created_on: date
 *     email: string
 *     password: hashed string
 *   }
 * }
 * 
 * songs: {
 *   song_id: {
 *     user_id: string
 *     song_name: string
 *     song_number: integer
 *     created_on: string
 *     composers: array<string>
 *     files: {
 *       mp3: absolute url || None
 *       midi: absolute url || None
 *       pdf: absolute url || None
 *     }
 *     design: design_id
 *   }
 * }
 * 
 * designs: {
 *   design_id: {
 *     ...
 *   }
 * }
 * 
 */

