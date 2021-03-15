const mongoose = require('mongoose');

const RoomModel = require('../../../models/room');
const UserModel = require('../../../models/user');

const room1 = { _id: new mongoose.Types.ObjectId(), name: 'javascript' };
const room2 = { _id: new mongoose.Types.ObjectId(), name: 'css' };
const room3 = { _id: new mongoose.Types.ObjectId(), name: 'html' };

const user1 = {
    sessionId: new mongoose.Types.ObjectId(),
    email: 'kaye.cenizal@gmail.com',
    username: 'kaye',
    chatroom: room1._id,
};

const user2 = {
    sessionId: new mongoose.Types.ObjectId(),
    email: 'callie.par@gmail.com',
    username: 'callie',
    chatroom: room1._id,
};

const user3 = {
    sessionId: new mongoose.Types.ObjectId(),
    email: 'john.par@gmail.com',
    username: 'john',
    chatroom: room2._id,
};

const configureDb = async () => {
    await RoomModel.deleteMany();
    await UserModel.deleteMany();
    await new RoomModel(room1).save();
    await new RoomModel(room2).save();
    await new RoomModel(room3).save();

    await new UserModel(user1).save();
    await new UserModel(user2).save();
    await new UserModel(user3).save();
};

module.exports = { configureDb, room1, room2, room3, user1, user2, user3 };
