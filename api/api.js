const db = require('./db');
const express = require('express')
const router = express.Router();


router.get('/', (req, res) => {
    res.send('Cookie party!');
});

module.exports = router;
