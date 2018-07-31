// Load environment variables for development
require('dotenv').load();

const express = require('express');
const apiRouterFunc = require('./api/api');
const db = require('./db/db');
db.connect();


const app = express();
app.use(express.static('public'));

// Mount router inside the file for easier unit testing
apiRouterFunc('/api', app);

app.get('/', (req, res) => res.send('See you later alligator'));

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
