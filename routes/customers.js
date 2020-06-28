const validateObjectid = require('../middleware/validateObjectid');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Customer, validate } = require('../models/customers');
const express = require('express');
const router = express.Router();
let server;

router.get('/', async (req, res) => {
    const customer = await Customer.find().sort('name');
    res.send(customer);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { isGold, name, phone } = req.body;
    const customer = new Customer({ isGold, name, phone });
    await customer.save();

    res.send(customer);
});

router.put('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { isGold, name, phone } = req.body;
    const customer = await Customer.findByIdAndUpdate(req.params.id, { isGold, name, phone }, { new: true });
    if (!customer) return res.status(404).send('The customer with given ID was not found');
    res.send(customer);
});

router.delete('/:id', [auth, admin], async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) return res.status(404).send('The customer with given ID was not found');
    res.send(customer);
});

router.get('/:id', validateObjectid, async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('The customer with given ID was not found');
    res.send(customer);
});

module.exports = router;