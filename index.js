const winston = require('winston');
const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use(morgan('tiny'));

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

const server = app.listen(port, () => winston.info(`Listening on port ${port}`));

module.exports = server;