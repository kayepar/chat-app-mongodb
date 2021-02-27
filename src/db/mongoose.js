const mongoose = require('mongoose');
const logger = require('../utilities/logger');

// mongoose.connection.on('error', console.log.bind(console, 'connection refused !!!!!'));
mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .catch((error) => logger.error('DB error encountered:', error));
