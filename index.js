const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('See you later alligator'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Started app on port ${port}`));