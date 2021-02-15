const express = require('express');
const router = new express.Router();
const Room = require('../models/room');

router.get('/validateUser', async (req, res) => {
    try {
        const { email, username, room } = req.query;
        const chatRoom = await Room.findOne({ name: room });
        const result = chatRoom ? chatRoom.validateUser(email, username) : { valid: true, duplicateFields: [] };

        res.status(200).send({
            result,
        });
    } catch (error) {
        res.status(400).send({
            error: error.message,
        });
    }
});

router.get('/getActiveRooms', (req, res) => {
    try {
        Room.getActiveRooms((error, rooms) => {
            if (error) throw new Error(error);

            res.status(200).send({
                rooms,
            });
        });
    } catch (error) {
        res.status(400).send({
            error: error.message,
        });
    }
});

module.exports = router;
