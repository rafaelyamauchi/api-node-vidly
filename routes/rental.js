const { Rental, validate } = require('../models/rental');
const { Movie } = require('../models/movies');
const { Customer } = require('../models/customers');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findOne({ _id: req.body.customerId });
    if (!customer) return res.status(400).send('Invalid customer');

    const movie = await Movie.findOne({ _id: req.body.movieId });
    if (!movie) return res.status(400).send('Invalid movie');

    if (movie.numberInStock === 0) return res.status(400).send('Movie no one in stock');

    const rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });
    try {
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id }, {
                $inc: { numberInStock: -1 }
            })
            .run();

        res.send(rental);
    } catch (error) {
        res.status(500).send('Something fail');
    }

    res.send(rental);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { dateReturned } = req.body;
    const rental = Rental.findOneAndUpdate(req.params.id,
        { dateReturned },
        { new: true })
    await rental.save();
    res.send(rental);
});

module.exports = router;