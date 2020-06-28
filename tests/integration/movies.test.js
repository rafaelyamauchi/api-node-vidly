const request = require('supertest');
const { Genre } = require('../../models/genres');
const { Movie } = require('../../models/movies');
const { User } = require('../../models/users');
const mongoose = require('mongoose');
let server;

describe('/api/movies', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async () => {
        await server.close();
        await Genre.deleteMany({});
        await Movie.deleteMany({});
    });

    describe('GET /', () => {
        it('should return all movies', async () => {
            await Movie.insertMany(
                [
                    { title: 'movie1', genre: { name: 'genre1' }, numberInStock: 10, dailyRentalRate: 2 },
                    { title: 'movie2', genre: { name: 'genre2' }, numberInStock: 10, dailyRentalRate: 2 }
                ]
            );
            const result = await request(server).get('/api/movies');
            expect(result.status).toBe(200);
            expect(result.body.some(m => m.title === 'movie1')).toBeTruthy();
            expect(result.body.some(m => m.title === 'movie2')).toBeTruthy();
        });
    });
    describe('GET /:id', () => {
        it('should return only movie that is equal to the input id', async () => {
            const movie = new Movie({ title: 'movie1', genre: { name: 'genre1' }, numberInStock: 10, dailyRentalRate: 2 });
            await movie.save();
            const result = await request(server).get('/api/movies/' + movie._id);
            expect(result.status).toBe(200);
            expect(result.body).toHaveProperty('title', movie.title);
        });
    });
    describe('GET /:id', () => {
        it('should return 404 if invalid id is passed', async () => {
            const result = await request(server).get('/api/movies/1');
            expect(result.status).toBe(404);
        });
    });
    describe('GET /:id', () => {
        it('should return 404 if no genre with the given ID', async () => {
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/movies/' + id);
            expect(result.status).toBe(404);
        });
    });

    describe('POST /', () => {
        let token;
        let title;
        let genre;
        let genreId;
        let numberInStock;
        let dailyRentalRate;

        const exec = async () => {
            return await request(server)
                .post('/api/movies')
                .set('x-auth-token', token)
                .send({ title, genreId, numberInStock, dailyRentalRate });
        }

        beforeEach(async () => {
            token = new User().generateAuthToken();
            title = '12345';
            genre = new Genre({ name: 'genre1' })
            await genre.save();
            genreId = genre._id;
            numberInStock = 10;
            dailyRentalRate = 2;

        });

        it('should return 401 if genre is not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });
        it('should return 400 if movie is less than 5 characters', async () => {
            title = '1234';
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if numberInStock is less than 0', async () => {
            numberInStock = '';
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if dailyRentalRate is less than 0', async () => {
            dailyRentalRate = '';
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if genreId is invalid', async () => {
            genreId = '';
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if the movie with given ID is not found', async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should save if movie valid is passed', async () => {
            await exec();
            const movie = await Movie.find({ title: 'title1' });
            expect(movie).not.toBeNull();
        });
        it('should return movie valid if it is saved', async () => {
            const result = await exec();
            expect(result.status).toBe(200);
        });
    });
    describe('PUT /:id', () => {
        let token;
        let id;
        let newTitle;
        let genreId;
        let newNumberInStock;
        let newDailyRentalRate;

        const exec = async () => {
            return await request(server)
                .put('/api/movies/' + id)
                .set('x-auth-token', token)
                .send({ title: newTitle, genreId, numberInStock: newNumberInStock, dailyRentalRate: newDailyRentalRate });
        }

        beforeEach(async () => {
            movieId = mongoose.Types.ObjectId();
            token = new User().generateAuthToken();

            genre = new Genre({ name: 'genre1' })
            await genre.save();
            genreId = genre._id;

            movie = new Movie({
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2,
                genre: { name: genre.name },
                numberInStock: 10
            });
            await movie.save();

            id = movie._id;
            newTitle = 'updateTitle';
            newNumberInStock = 11;
            newDailyRentalRate = 3;

        });
        it('should return 401 if genre is not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });
        it('should return 400 if movie is less than 5 characters', async () => {
            newTitle = '1234';
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if numberInStock is less than 0', async () => {
            newNumberInStock = '';
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if dailyRentalRate is less than 0', async () => {
            newDailyRentalRate = '';
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if genreId is invalid', async () => {
            genreId = '';
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if the movie with given genreID is not found', async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 404 if the movie with given ID is not found', async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should update the movie if input is valid', async () => {
            await exec();
            const updateMovie = await Movie.findById(movie._id);
            expect(updateMovie.title).toBe(newTitle);
        });
        it('should return the updated movie if it is valid', async () => {
            const result = await exec();
            expect(result.body).toHaveProperty('_id');
            expect(result.body).toHaveProperty('title', newTitle);
        });
    });
    describe('DELETE /:id', () => {
        let token;
        let id;
        let genre;
        let genreId;

        const exec = async () => {
            return await request(server)
                .delete('/api/movies/' + id)
                .set('x-auth-token', token)
                .send();
        }

        beforeEach(async () => {
            token = new User({ isAdmin: true }).generateAuthToken();

            genre = new Genre({ name: 'genre1' })
            await genre.save();
            genreId = genre._id;

            movie = new Movie({
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2,
                genre: { name: genre.name },
                numberInStock: 10
            });
            await movie.save();
            id = movie._id;
        });

        it('should return 401 if client is not logged', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });
        it('should return 403 if the user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        });
        it('should return 404 if the movie with given ID is not found', async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should delete the movie if input is valid', async () => {
            await exec();
            const movieInDb = await Movie.findById(movie._id);
            expect(movieInDb).toBeNull();
        });
        it('should return the removed movie', async () => {
            const result = await exec();
            expect(result.body).toHaveProperty('_id');
            expect(result.body).toHaveProperty('title');
        });
    });

})