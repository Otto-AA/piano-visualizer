const { Router } = require('express')
const visualizationModels = require('../db/models/Visualizations');
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


router.post('/visualization', isAuthenticated, (req, res, next) => {
    const { visualizationType, ...visualization } = req.body;
    
    saveVisualization(visualization, visualizationType)
        .then(({ _id }) => res.status(200).send(SuccessResponse({ data: { visualizationId: _id }})))
        .catch(err => {
            if (err.message === 'invalid visualization type' || err.name === 'StrictModeError' || err.name === 'ValidationError') {
                return res.status(400).send(Response({
                    code: 400,
                    message: err.message
                }));
            }
            
            return next(err);
        });
});


function saveVisualization(visualization, visualizationType) {
    return new Promise((resolve, reject) => {
        if (!isValidVisualizationType(visualizationType))
            return reject(new Error('invalid visualization type'));

        const visualizationModel = getVisualizationModel(visualizationType);
        return visualizationModel.create(visualization, (err, savedVisualization) => {
            if (err)
                return reject(err);
    
            return resolve(savedVisualization);
        });
    });
        
}

function isValidVisualizationType(visualizationType) {
    return visualizationModels.hasOwnProperty(visualizationType);
}

function getVisualizationModel(modelName) {
    return visualizationModels[modelName];
}

module.exports = router;
// module.exports = function (path, app) {
//     app.use(path, router);
// };
