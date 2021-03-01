const express = require('express');

const router = new express.Router();
const { validateUser, getActiveRooms } = require('../controller/room-controller');

router.get('/validateUser', validateUser);
router.get('/getActiveRooms', getActiveRooms);

module.exports = router;
