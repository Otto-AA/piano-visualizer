const { Router } = require('express')
const User = require('../db/models/User');
const Song = require('../db/models/Song');
const visualizationModels = require('../db/models/VisualizationStandard');
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
    
});