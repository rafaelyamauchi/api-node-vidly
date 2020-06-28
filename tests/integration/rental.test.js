const request = require('supertest');
const { Genre } = require('../../models/genres');
const { Rental } = require('../../models/rental');
const { Movie } = require('../../models/movies');
const { Customer } = require('../../models/customers');
const { User } = require('../../models/users');
const mongoose = require('mongoose');
let server;

describe('/api/rental', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async () => {
        await server.close();
        await Movie.deleteMany({});
        await Customer.deleteMany({});
    });

    describe('GET /', () => {
        const customerId = mongoose.Types.ObjectId();
        const movieId = mongoose.Types.ObjectId();
        const token = new User().generateAuthToken();
        it('should return all rentals', async () => {
            await Rental.insertMany(
                [
                    {
                        customer: {
                            _id: customerId,
                            name: '12345',
                            phone: '123456789'
                        },
                        movie: {
                            _id: movieId,
                            title: '12345',
                            numberInStock: 10,
                            dailyRentalRate: 2
                        }
                    }
                ]
            );
            const result = await request(server).get('/api/rental').set('x-auth-token', token);
            expect(result.status).toBe(200);
            expect(result.body.some(c => c.customer.name === '12345')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return only rental that is equal to the input id', async () => {
            const customerId = mongoose.Types.ObjectId();
            const movieId = mongoose.Types.ObjectId();
            const token = new User().generateAuthToken();

            const rental = new Rental({
                customer: {
                    _id: customerId,
                    name: '12345',
                    phone: '123456789'
                },
                movie: {
                    _id: movieId,
                    title: '12345',
                    numberInStock: 10,
                    dailyRentalRate: 2
                }
            });
            await rental.save();
            const result = await request(server).get('/api/rental/' + rental._id).set('x-auth-token', token);
            expect(result.status).toBe(200);
            //expect(result.body).toHaveProperty('_id');
        })
    });

    describe('GET /:id', () => {
        it('should return 404 if invalid id is passed', async () => {
            const token = new User().generateAuthToken();
            const result = await request(server).get('/api/rental/1').set('x-auth-token', token);
            expect(result.status).toBe(404);
        })
    });

    describe('GET /:id', () => {
        it('should return 404 if no customer with the given ID', async () => {
            const token = new User().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/rental/' + id).set('x-auth-token', token);
            expect(result.status).toBe(404);
        })
    });

    describe('POST/', () => {
        let customerId;
        let movieId;
        let rental;
        let movie;
        let customer;
        let token;

        const exec = async () => {
            return await request(server)
                .post('/api/rental')
                .set('x-auth-token', token)
                .send({ customerId, movieId });
        }

        beforeEach(async () => {
            server = require('../../index');
            token = new User().generateAuthToken();

            customer = new Customer({ name: '12345', phone: '123456789', isGold: true })
            await customer.save();
            customerId = customer._id;

            movie = new Movie({
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2,
                genre: { name: '12345' },
                numberInStock: 10
            });
            await movie.save();
            movieId = movie._id;

            rental = new Rental({
                customer: {
                    _id: customerId,
                    name: '12345',
                    phone: '123456789'
                },
                movie: {
                    _id: movieId,
                    title: '12345',
                    dailyRentalRate: 2,
                    numberInStock: 10
                }
            });
            await rental.save();
        });
        afterEach(async () => {
            await server.close();
            await Rental.deleteMany({});
            await Movie.deleteMany({});
            await Customer.deleteMany({});
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
        it('should return 400 if customerId is not found', async () => {
            customerId = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if movieId is not found', async () => {
            movieId = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if number in stock is equal to 0', async () => {
            movie.numberInStock = 0;
            await movie.save();
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 200 if rental is valid', async () => {
            customerId = customer._id;
            movieId = movie._id;
            const result = await exec();
            expect(result.status).toBe(200);
        });
    });
});