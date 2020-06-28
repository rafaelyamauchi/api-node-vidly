const moment = require('moment');
const request = require('supertest');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/users');
const { Movie } = require('../../models/movies');
const mongoose = require('mongoose');

describe('/api/returns', () => {
    let server;
    let customerId;
    let rental;
    let movie;
    let token;

    const exec = async () => {
        return await request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    }

    beforeEach(async () => {
        server = require('../../index');
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: { name: '12345' },
            numberInStock: 10
        });
        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '123456789'
            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2
            }
        });
        await rental.save();
    });
    afterEach(async () => {
        await server.close();
        await Rental.deleteMany({});
        await Movie.deleteMany({});
    });

    it('should return 401 if client is not logged in', async () => {
        token = '';
        const result = await exec();
        expect(result.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
        customerId = '';
        const result = await exec();
        expect(result.status).toBe(400);
    });
    it('should return 400 if movieId is not provided', async () => {
        movieId = '';
        const result = await exec();
        expect(result.status).toBe(400);
    });
    it('should return 404 if no rental  found customer/movie', async () => {
        await Rental.deleteMany({});
        const result = await exec();
        expect(result.status).toBe(404);
    });
    it('should return 400 if rental is already processed', async () => {
        rental.dateReturned = new Date();
        await rental.save();
        const result = await exec();
        expect(result.status).toBe(400);
    });
    it('should return 200 if rental is valid', async () => {
        const result = await exec();
        expect(result.status).toBe(200);
    });
    it('should return set dateReturned if input is valid', async () => {
        const result = await exec();
        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
    });
    it('should return Rentalfee ', async () => {
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();
        const result = await exec();
        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
    });
    it('should increase the movie stock', async () => {
        await exec();

        const movieInDb = await Movie.findById(movie._id);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });
    it('should return if rental is valid', async () => {
        const result = await exec();
        expect(result.body).toHaveProperty('dateReturned');
    });
});