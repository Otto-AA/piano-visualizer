const mongoose = require('mongoose');
const User = require('./models/User');
const SignupVerification = require('./models/SignupVerification');
const logger = require('../config/logger');

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

const disconnect = mongoose.disconnect;

function logDatabase() {
    User.find().then(res => logger.verbose('Users', res));
    SignupVerification.find().then(res => logger.verbose('SignupVerifications', res));
}

module.exports = {
    connect,
    disconnect,
    logDatabase
};
