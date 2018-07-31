const mongoose = require('mongoose');
const User = require('./models/User');
const SignupVerification = require('./models/SignupVerification');

const mongo_url = process.env.MONGO_URL;
mongoose.connect(mongo_url, (err) => {
    if (err) {
        console.error('Error while connecting to database');
        throw err;
    }
});




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

