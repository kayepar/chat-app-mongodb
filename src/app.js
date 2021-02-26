const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const hbs = require('express-hbs');
const morgan = require('morgan');
require('./db/mongoose');

const roomRouter = require('./router/room');
const emailRouter = require('./router/email');
const dbUtils = require('./db/utils');
const CustomError = require('./error/CustomError');

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
app.use(emailRouter);

app.use((req, res, next) => {
    next(new CustomError('Page not found', 'Resource unavailable', 404));
});

app.use((err, req, res, next) => {
    // console.log(`middleware stack: ${err.stack}`);
    const postscript =
        err.status === 500 ? 'Administrator has already been notified. Please check back again later.' : '';

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
