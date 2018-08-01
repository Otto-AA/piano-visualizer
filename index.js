// Load environment variables for development
require('dotenv').load();

const express = require('express');
const session = require('express-session');
const apiRouterFunc = require('./api/api');
const db = require('./db/db');
db.connect();


const app = express();
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    domain: process.env.domain,
    maxAge: 60 * 60 * 1000
  }
}));

// Mount router inside the file for easier unit testing
apiRouterFunc('/api', app);
app.use(express.static('public'));

app.get('/test', (req, res) => {
  req.session.count = req.session.count ? req.session.count + 1 : 1;
  res.send(`See you later alligator x${req.session.count}`)
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/loggedIn',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

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
