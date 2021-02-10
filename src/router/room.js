const express = require('express');
const router = new express.Router();
const Room = require('../models/room');

router.get('/validateUser', async (req, res) => {
    console.log(req.query);

    try {
        const room = await Room.find({ name: req.query.room });

        console.log(`room: ${room}`);

        res.status(200).send({
            isValid: true,
        });
    } catch (error) {
        res.status(400).send({
            error: error.message,
        });
    }
    // const user = new User(req.body);
    // try {
    //     await user.save();
    //     sendWelcomeEmail(user.email, user.name);
    //     const token = await user.getAuthToken();
    //     // res.status(201).send({user, token});
    //     res.cookie('auth_token', token);
    //     res.cookie('id', user.id);
    //     res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'));
    // } catch (error) {
    //     // validation errors
    //     res.status(400).send({ error: error.message });
    // }
});

module.exports = router;
