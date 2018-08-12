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

router.get('/visualization', (req, res, next) => {
    const { visualizationId, visualizationType } = req.query;

    return getVisualization(visualizationId, visualizationType)
        .then(visualization => res.status(200).send(SuccessResponse({ data: { visualization } })))
        .catch(err => {
            if (err.message === 'not found')
                return res.status(404).send(notFoundError);

            return next(err);
        });
});

router.delete('/visualization', (req, res, next) => {
    const { visualizationId, visualizationType } = req.query;

    return deleteVisualization(visualizationId, visualizationType)
        .then(() => res.status(200).send(SuccessResponse()))
        .catch(err => {
            if (err.message === 'not found')
                return res.status(404).send(notFoundError);

            return next(err);
        });
});


function saveVisualization(visualization, visualizationType) {
    return new Promise((resolve, reject) => {
        const visualizationModel = getVisualizationModel(visualizationType);
        return visualizationModel.create(visualization, (err, savedVisualization) => {
            if (err)
                return reject(err);
    
            return resolve(savedVisualization);
        });
    });       
}

function getVisualization(visualizationId, visualizationType) {
    return new Promise((resolve, reject) => {
        const visualizationModel = getVisualizationModel(visualizationType);
        
        visualizationModel.findById(visualizationId, (err, visualization) => {
            if (err)
                return reject(err);
            else if (!visualization)
                return reject(new Error('not found'));
            
            return resolve(visualization);
        });
    });
}

function deleteVisualization(visualizationId, visualizationType) {
    return new Promise((resolve, reject) => {
        const visualizationModel = getVisualizationModel(visualizationType);

        visualizationModel.findByIdAndRemove(visualizationId, (err, visualization) => {
            if (err)
                return reject(err);

            // TODO: Check if !visualization (1) can occur and (2) means that it was not found. Same for DELETE /song
            
            return resolve();
        });
    });
}

function getVisualizationModel(modelName) {
    if (!isValidVisualizationType(modelName))
        throw new Error('invalid visualization type');
    
    return visualizationModels[modelName];
}

function isValidVisualizationType(visualizationType) {
    return visualizationModels.hasOwnProperty(visualizationType);
}

module.exports = router;
// module.exports = function (path, app) {
//     app.use(path, router);
// };
