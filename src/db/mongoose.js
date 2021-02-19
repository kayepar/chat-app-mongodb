const mongoose = require('mongoose');

// mongoose.connection.on('error', console.log.bind(console, 'connection refused !!!!!'));
mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .catch((error) => console.log('DB error encountered', error));
