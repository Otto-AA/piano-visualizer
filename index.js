// Load environment variables for development
require('dotenv').load();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const apiRouterFunc = require('./api/api');
const sessionConfig = require('./config/session');
const passportConfig = require('./config/passport');
const db = require('./db/db');
db.connect();


const app = express();


// TODO: Document me
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
sessionConfig(app);
passportConfig(app);
apiRouterFunc('/api', app);
app.use(express.static('public'));


const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log(`Started app on port ${port}`));
server.on('close', function() {
  console.log(' Stopping ...');
  db.disconnect();
});

module.exports = {
  app,
  server
};
