const Joi = require('joi');
const express = require('express');
const router = express.Router();

const genres = [
    { id: 1, genre: 'action' },
    { id: 2, genre: 'comedy' },
    { id: 3, genre: 'romance' }
];

router.get('/', (req, res) => {
    res.send(genres);
});

router.post('/', (req, res) => {
    const { error } = validateCourse(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = {
        id: genres.length + 1,
        genre: req.body.genre
    }
    genres.push(genre);
    res.send(genre);
});

router.put('/:id', (req, res) => {
    const genre = genres.find(c => c.id === parseInt(req.params.id));
    if (!genre) return res.status(404).send('The genre with given ID was not found');
    const { error } = validateCourse(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    genre.genre = req.body.genre;
    res.send(genre);
});

router.delete('/:id', (req, res) => {
    const genre = genres.find(g => g.id === parseInt(req.params.id));
    if (!genre) return res.status(404).send('The genre with given ID was not found');

    const index = genres.indexOf(genre);
    genres.splice(index, 1);

    res.send(genre);
});

router.get('/:id', (req, res) => {
    const genre = genres.find(c => c.id === parseInt(req.params.id));
    if (!genre) return res.status(404).send('The genre with given ID was not found');
    res.send(genre);
});

function validateCourse(genre) {
    const schema = {
        genre: Joi.string().min(3).required()
    };

    return Joi.validate(genre, schema);
}

module.exports = router;