const { Router } = require('express')
const User = require('../db/models/User');
const Song = require('../db/models/Song');
const visualizationModels = require('../db/models/visualizations/VisualizationStandard');
const { SuccessResponse, Response, invalidCredentialsError, loginRequiredError, notFoundError } = require('./Response');
const { apiLogger } = require('../config/logger');

const router = Router();

// TODO: Somehow share this function between routers
function isAuthenticated(req, res, next) {
    apiLogger.silly('checking authentication');
    if (req.isAuthenticated()) {
        apiLogger.silly('user is authenticated');
        return next();
    }

    apiLogger.verbose('user authentication failed');
    return res.status(401)
        .send(loginRequiredError);
}

router.post('/song', isAuthenticated, (req, res, next) => {
    const song = req.body;
    
    // TODO: Add error handling for already existing (if this makes sense)
    return saveSong(song)
        .then(({ _id }) => {
            apiLogger.verbose('saved song', _id);
            return res.status(200).send(SuccessResponse({ data: { songId: _id }}))
        })
        .catch(err => {
            apiLogger.verbose('error while saving song', err);
            // TODO: Giving an invalid ObjectId (e.g. undefined) returns no ValidationError
            if (err.name === 'StrictModeError' || err.name === 'ValidationError') {
                return res.status(400).send(Response({
                    code: 400,
                    message: err.message
                }));
            }
            
            return next(err);
        });
});


function saveSong(song) {
    return new Promise((resolve, reject) => {
        return Song.create(song, (err, savedSong) => {
            if (err)
                return reject(err);
    
            return resolve(savedSong);
        });
    });       
}

module.exports = router;