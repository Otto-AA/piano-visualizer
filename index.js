// Load environment variables for development
require('dotenv').load();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const apiRouterFunc = require('./api/api');
const sessionConfig = require('./config/session');
const passportConfig = require('./config/passport');
const { app: appLogger, requests: requestsLogger } = require('./config/logger');
const winston = require('winston');
const expressWinston = require('express-winston');
const db = require('./db/db');

appLogger.silly('Loaded modules');

const app = express();

db.connect()
  .then(() => appLogger.info('Connected to database'))
  .catch(err => {
    appLogger.error('Error while connecting to database', err);
    throw new Error('Err while connecting to database');
  });




// TODO: Document me
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
sessionConfig(app);
passportConfig(app);

app.use(expressWinston.logger({
  winstonInstance: requestsLogger
}));

apiRouterFunc('/api', app);
app.use(express.static('public'));


appLogger.verbose('Setting up server...');
const port = process.env.PORT || 5000;
const server = app.listen(port, () => appLogger.info(`Started app on port ${port}`));

server.on('close', function() {
  appLogger.info('Closing server');
  db.disconnect();
});

module.exports = {
  app,
  server
};
