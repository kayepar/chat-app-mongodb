const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const hbs = require('express-hbs');
const morgan = require('morgan');
require('./db/mongoose');

const roomRouter = require('./router/room');
const dbUtils = require('./db/dbUtils');
const CustomError = require('./error/CustomError');
const logger = require('./utilities/logger');

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
    next(new CustomError('Page not found', 'Resource unavailable', 404));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    logger.error(err);

    const postscript =
        err.status === 500 ? 'The administrator has already been notified. Please check back again later.' : '';

    res.status(err.status);
    res.render('customError', {
        layout: 'error',
        message: err.message,
        postscript,
    });
});

dbUtils.cleanupDb();
require('./socket')(io);

module.exports = server;
