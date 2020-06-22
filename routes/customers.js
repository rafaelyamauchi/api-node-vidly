const { Customer, validate } = require('../models/customers');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const customer = await Customer.find().sort('name');
    res.send(customer);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { isGold, name, phone } = req.body;
    const customer = new Customer({ isGold, name, phone });
    await customer.save();

    res.send(customer);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { isGold, name, phone } = req.body;
    const customer = await Customer.findOneAndUpdate(req.params.id, { isGold, name, phone }, { new: true });
    res.send(customer);
});

router.delete('/:id', async (req, res) => {
    const customer = await Customer.findOneAndRemove(req.params.id);
    if (!customer) return res.status(404).send('The customer with given ID was not found');
    res.send(customer);
});

router.get('/:id', async (req, res) => {
    const customer = await Customer.findOne({ _id: req.params.id });
    if (!customer) return res.status(404).send('The customer with given ID was not found');
    res.send(customer);
});

module.exports = router;