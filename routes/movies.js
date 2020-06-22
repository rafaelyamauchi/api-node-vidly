const { Movie, validate } = require('../models/movies');
const express = require('express');
const { Genre } = require('../models/genres');
const router = express.Router();

router.get('/', async (req, res) => {
    const movies = await Movie.find().sort('title');
    res.send(movies);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findOne({ _id: req.body.genreId });
    if (!genre) return res.status(400).send('Invalid Genre');

    const movie = new Movie({
        title: req.body.title,
        genre:
        {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    await movie.save();
    res.send(movie);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findOne({ _id: req.body.genreId });
    if (!genre) return res.status(400).send('Invalid Genre');

    const { title, numberInStock, dailyRentalRate } = req.body;
    const movie = await Movie.findOneAndUpdate(req.params.id,
        {
            title,
            genre: {
                _id: genre._id,
                name: genre.name
            },
            numberInStock,
            dailyRentalRate
        }, { new: true });
    if (!movie) return res.status(404).send('The genre with given ID was not found');

    res.send(movie);
});

router.delete('/:id', async (req, res) => {
    const movie = await Movie.findOneAndRemove(req.params.id);
    if (!movie) return res.status(404).send('The genre with given ID was not found');

    res.send(movie);
});

router.get('/:id', async (req, res) => {
    const movie = await Movie.findOne({ _id: req.params.id });
    if (!movie) return res.status(404).send('The genre with given ID was not found');
    res.send(movie);
});

module.exports = router;