const mongoose = require('mongoose');
const User = require('./models/User');
const SignupVerification = require('./models/SignupVerification');

const mongo_url = process.env.MONGO_URL;

function connect () {
    return new Promise((resolve, reject) => {
        mongoose.connect(mongo_url, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

function disconnect = mongoose.disconnect;

function logDatabase() {
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
}

module.exports = {
    connect,
    disconnect,
    logDatabase
};
