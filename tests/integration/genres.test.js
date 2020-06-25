const request = require('supertest');
const { Genre } = require('../../models/genres');
const { User } = require('../../models/users');
const mongoose = require('mongoose');
let server;

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async () => {
        server.close();
        await Genre.deleteMany({});
    });

    describe('GET /', () => {
        it('should return all genres', async () => {
            await Genre.collection.insertMany([
                { name: 'Genre1' },
                { name: 'Genre2' }
            ]);

            const res = await request(server).get('/api/genres');

            expect(res.status).toBe(200);
            expect(res.body.some(g => g.name === 'Genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'Genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return only genre that is equal to the input id', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server).get('/api/genres/' + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        })
    });

    describe('GET /:id', () => {
        it('should return 404 if invalid id is passed', async () => {
            const res = await request(server).get('/api/genres/1');

            expect(res.status).toBe(404);
        })
    });

    describe('GET /:id', () => {
        it('should return 404 if no genre with the given ID', async () => {
            const id = mongoose.Types.ObjectId();
            console.log(id);
            const res = await request(server).get('/api/genres/' + id);

            expect(res.status).toBe(404);
        })
    });

    describe('POST /', () => {
        let token;
        let name;

        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if genre is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 5 characters', async () => {
            name = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is greater than 50 characters', async () => {
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async () => {
            await exec();
            const genre = await Genre.find({ name: 'genre1' });
            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');

        });
    });
});