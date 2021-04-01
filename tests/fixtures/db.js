const mongoose = require('mongoose');

const RoomModel = require('../../src/models/room');
const UserModel = require('../../src/models/user');
const MessageModel = require('../../src/models/message');

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

const user4 = {
    sessionId: new mongoose.Types.ObjectId(),
    email: 'catherine.par@gmail.com',
    username: 'catherine',
    chatroom: room3._id,
};

const configureDb = async () => {
    await resetDb();
    await new RoomModel(room1).save();
    await new RoomModel(room2).save();
    await new RoomModel(room3).save();

    await new UserModel(user1).save();
    await new UserModel(user2).save();
    await new UserModel(user3).save();
    await new UserModel(user4).save();
};

const resetDb = async () => {
    await RoomModel.deleteMany();
    await UserModel.deleteMany();
    await MessageModel.deleteMany();
};

module.exports = { configureDb, resetDb };
