const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const hbs = require('express-hbs');
const morgan = require('morgan');
require('./db/mongoose');

const roomRouter = require('./router/room');
const dbUtils = require('./db/utils');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../templates/views'));
app.engine(
    'hbs',
    hbs.express4({
        layoutsDir: path.join(__dirname, '../templates/layouts'),
    })
);

// setup static directory to serve
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.json());
app.use(morgan('dev'));
app.use(roomRouter);

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '../dist/404.html'));
});

// todo: add 500 error handler

dbUtils.cleanupDb();
require('./socket')(io);

module.exports = server;
