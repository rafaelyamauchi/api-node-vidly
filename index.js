const winston = require('winston');
const morgan = require('morgan');
const express = require('express');
const app = express();

const port = process.env.PORT || 3900;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('tiny'));

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

const server = app.listen(port, () => winston.info(`Listening on port ${port}`));

module.exports = server;