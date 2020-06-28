const request = require('supertest');
const { Customer } = require('../../models/customers');
const { User } = require('../../models/users');
const mongoose = require('mongoose');
let server;

describe('/api/customers', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async () => {
        await server.close();
        await Customer.deleteMany({});
    });

    describe('GET /', () => {
        it('should return all customers', async () => {
            const token = new User().generateAuthToken();
            await Customer.insertMany(
                [
                    { name: 'customer1', phone: '998289230', isGold: true },
                    { name: 'customer2', phone: '998289230', isGold: true }
                ]
            );
            const result = await request(server).get('/api/customers').set('x-auth-token', token);
            expect(result.status).toBe(200);
            expect(result.body.some(c => c.name === 'customer1')).toBeTruthy();
            expect(result.body.some(c => c.name === 'customer2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return only customer that is equal to the input id', async () => {
            const token = new User().generateAuthToken();
            const customer = new Customer({ name: 'customer1', phone: '998289230', isGold: true })
            await customer.save();
            const result = await request(server).get('/api/customers/' + customer._id).set('x-auth-token', token);
            expect(result.status).toBe(200);
            expect(result.body).toHaveProperty('name', customer.name);
        });
    });
    describe('GET /:id', () => {
        it('should return 404 if invalid id is passed', async () => {
            const token = new User().generateAuthToken();
            const result = await request(server).get('/api/customers/1').set('x-auth-token', token);
            expect(result.status).toBe(404);
        });
    });
    describe('GET /:id', () => {
        it('should return 404 if no customer with given id', async () => {
            const token = new User().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/customers/' + id).set('x-auth-token', token);
            expect(result.status).toBe(404);
        });
    });
    describe('POST/', () => {
        let token;
        let name;
        let isGold;
        let phone;

        const exec = async () => {
            return await request(server)
                .post('/api/customers')
                .set('x-auth-token', token)
                .send({ name, isGold, phone });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'customer1';
            isGold = true;
            phone = '998289230';
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });
        it('should return 400 if customer name is less than 5 characters', async () => {
            name = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if customer name is greater than 50 characters', async () => {
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should save the customer if it is valid', async () => {
            await exec();
            const customer = await Customer.findOne({ name: 'customer1' });
            expect(customer).not.toBeNull();
        });
        it('should return the customer if it is valid', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'customer1');
        });
    });
    describe('PUT /:id', () => {
        let token;
        let customer;
        let newName;
        let newGold;
        let newPhone;
        let id;

        const exec = async () => {
            return await request(server)
                .put('/api/customers/' + id)
                .set('x-auth-token', token)
                .send({ name: newName, isGold: newGold, phone: newPhone });
        }

        beforeEach(async () => {
            token = new User().generateAuthToken();
            customer = new Customer({ name: 'customer1', phone: '123456789', isGold: true });
            await customer.save();

            id = customer._id;
            newName = 'updateName';
            newPhone = '987654321';
            newGold = false;
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });
        it('should return 400 if customer is less than 5 characters', async () => {
            newName = '1234';
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if phone is less than 9 characters', async () => {
            newPhone = '12345678';
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 400 if customer is greater than 50 characters', async () => {
            newName = new Array(52).join('a');
            const result = await exec();
            expect(result.status).toBe(400);
        });
        it('should return 404 if customer with given ID is not found', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });
        it('should update the customer if input is valid', async () => {
            await exec();
            const updateCustomer = await Customer.findById(customer._id);
            expect(updateCustomer.name).toBe(newName);
        });
        it('should return the updated customer if it is valid', async () => {
            const result = await exec();
            expect(result.body).toHaveProperty('_id');
            expect(result.body).toHaveProperty('name', newName);
        });
    });
    describe('DELETE /:id', () => {
        let token;
        let id;
        let customer;

        const exec = async () => {
            return await request(server)
                .delete('/api/customers/' + id)
                .set('x-auth-token', token)
                .send();
        }

        beforeEach(async () => {
            token = new User({ isAdmin: true }).generateAuthToken();
            customer = new Customer({ name: 'customer1', phone: '123456789', isGold: true });
            await customer.save();
            id = customer._id;
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });
        it('should return 403 if the user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(403);
        });
        it('should return 404 if the customer with given ID is not found', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });
        it('should delete the customer if input is valid', async () => {
            await exec();
            const customerInDb = await Customer.findById(customer._id);
            expect(customerInDb).toBeNull();
        });
        it('should return the removed customer', async () => {
            const result = await exec();
            expect(result.body).toHaveProperty('_id');
            expect(result.body).toHaveProperty('name');
        });
    });
});