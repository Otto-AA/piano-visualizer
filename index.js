// Load environment variables for development
require('dotenv').load();

const express = require('express');
const apiRouterFunc = require('./api/api');


const app = express();
app.use(express.static('public'));

// Mount router inside the file for easier unit testing
apiRouterFunc('/api', app);

app.get('/', (req, res) => res.send('See you later alligator'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Started app on port ${port}`));

module.exports = app;