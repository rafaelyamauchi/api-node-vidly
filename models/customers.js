const Joi = require('joi');
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    isGold: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    phone: {
        type: String,
        required: true,
        minlength: 9,
        maxlength: 9
    }
});

function validateCustomer(customer) {
    const schema = {
        isGold: Joi.boolean(),
        name: Joi.string().min(5).max(50).required(),
        phone: Joi.string().min(9).max(9).required()
    };

    return Joi.validate(customer, schema);
}

const Customer = mongoose.model('Customer', customerSchema);

module.exports = {
    Customer,
    validate: validateCustomer
};