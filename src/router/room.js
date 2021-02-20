const express = require('express');
const router = new express.Router();
const Room = require('../models/room');

router.get('/validateUser', async (req, res, next) => {
    try {
        const { email, username, room } = req.query;

        if (!email || !username || !room) {
            throw new Error('Incomplete input');
        }

        const chatRoom = await Room.findOne({ name: room });
        const result = chatRoom ? chatRoom.validateUser(email, username) : { valid: true, duplicateFields: [] };

        res.status(200).send({
            result,
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/getActiveRooms', (req, res, next) => {
    try {
        Room.getActiveRooms((error, rooms) => {
            if (error) throw new Error(error);

            res.status(200).send({
                rooms,
            });
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
