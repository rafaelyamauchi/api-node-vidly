const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const auth = require('./routes/auth');
const home = require('./routes/home');
const users = require('./routes/users');
const genres = require('./routes/genres');
const movies = require('./routes/movies');
const customers = require('./routes/customers');
const rentals = require('./routes/rental');
const express = require('express');
const app = express();

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR jwtPrivateKey is not defined.');
    process.exit(1);
}

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use(morgan('tiny'));

app.use('/', home);
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/genres', genres);
app.use('/api/movies', movies);
app.use('/api/customers', customers);
app.use('/api/rental', rentals);

mongoose
    .connect('mongodb://localhost/vidly', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => app.listen(port, () => console.log(`Listening on port ${port}`)))
    .catch(err => console.log(err));