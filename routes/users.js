const { User, validate } = require('../models/users');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('user already registred');

    const { email, name, password } = req.body;
    user = new User({
        name, email, password
    });

    await user.save();
    res.send(user);
});

module.exports = router;