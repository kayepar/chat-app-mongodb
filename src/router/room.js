const express = require('express');

const router = new express.Router();
const { validateUser, getActiveRooms } = require('../controller/room-controller');
const { preSanitizeAndValidate } = require('../utilities/input-utils');

router.get('/validateUser', preSanitizeAndValidate, validateUser);
router.get('/getActiveRooms', getActiveRooms);

module.exports = router;
