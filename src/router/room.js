const express = require('express');

const router = new express.Router();
const { validateUser, getActiveRooms } = require('../controller/room-controller');
const { preValidateInput } = require('../utilities/input-utils');

router.get('/validateUser', preValidateInput, validateUser);
router.get('/getActiveRooms', getActiveRooms);

module.exports = router;
