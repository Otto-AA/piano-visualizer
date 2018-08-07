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

    if (!visualizationModels.hasOwnProperty(visualizationType)) {
        apiLogger.verbose(`invalid visualization type {${visualizationType}}`);

        return res.status(400)
            .send(Response({
                code: 400,
                message: 'invalid visualization type'
            }));
    }

    const visualizationModel = visualizationModels[visualizationType];

    visualizationModel.create(visualization, (err, savedVisualization) => {
        if (err) {
            throw err;
        }

        if (!savedVisualization) {
            apiLogger.verbose('!savedVisualization');
            
            return res.status(400)
                .send(Response({ code: 404 }));
        }

        return res.status(200)
            .send(SuccessResponse({ data: { visualizationId: savedVisualization._id } }));
    });
});

router.get('/test', (req, res) => res.status(200).send(true));

module.exports = router;
// module.exports = function (path, app) {
//     app.use(path, router);
// };
