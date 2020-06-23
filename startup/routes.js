const express = require('express');
const error = require('../middleware/error');
const auth = require('../routes/auth');
const home = require('../routes/home');
const users = require('../routes/users');
const genres = require('../routes/genres');
const movies = require('../routes/movies');
const customers = require('../routes/customers');
const rentals = require('../routes/rental');

module.exports = function (app) {
    app.use('/', home);
    app.use('/api/auth', auth);
    app.use('/api/users', users);
    app.use('/api/genres', genres);
    app.use('/api/movies', movies);
    app.use('/api/customers', customers);
    app.use('/api/rental', rentals);
    app.use(error);
}