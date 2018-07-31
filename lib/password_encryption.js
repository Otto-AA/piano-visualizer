const crypto = require('crypto');

const encrypt = (pwd) => crypto.createHash('sha256').update(pwd).digest('hex');
const comparePasswords = (pwd, hash) => hash === encrypt(pwd);

module.exports = {
    encrypt,
    comparePasswords
};