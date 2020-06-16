const morgan = require('morgan');
const helmet = require('helmet');
const home = require('./routes/home');
const genres = require('./routes/genres');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use(morgan('tiny'));

app.use('/', home);
app.use('/api/genres', genres);

app.listen(port, () => console.log(`Listening on port ${port}`));