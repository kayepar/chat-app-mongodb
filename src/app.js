const path = require('path');
const express = require('express');
const hbs = require('express-hbs');


const app = express();

// setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../templates/views'));
app.engine('hbs', hbs.express4({
    partialsDir: path.join(__dirname, '../templates/partials'),
    layoutsDir: path.join(__dirname, '../templates/layouts')
    // defaultLayout: path.join(__dirname, '../templates/layouts/main')
}));

// setup static directory to serve
app.use(express.static(path.join(__dirname, '../public')));

app.get('', (req, res) => {
    res.render('index');
});

module.exports = app;