const express = require('express');
const router = new express.Router();
const Room = require('../models/room');
const CustomError = require('../error/CustomError');

router.get('/validateUser', async (req, res, next) => {
    try {
        const { email, username, room } = req.query;

        if (!email || !username || !room) {
            throw new CustomError('Invalid request', 'Missing input', 400);
        }

        const chatRoom = await Room.findOne({ name: room });
        const result = chatRoom ? chatRoom.validateUser(email, username) : { valid: true, duplicateFields: [] };

        // res.status(200).send({
        //     result,
        // });

        res.status(200).send(result());
    } catch (error) {
        if (!(error instanceof CustomError)) {
            return next(new CustomError('Something went wrong', error.stack, 500, true));
        }

        return next(error);
    }
});

router.get('/getActiveRooms', (req, res, next) => {
    try {
        Room.getActiveRooms((error, rooms) => {
            if (error) throw new CustomError('Something went wrong', error.stack, 500, true);

            res.status(200).send({
                rooms,
            });
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
