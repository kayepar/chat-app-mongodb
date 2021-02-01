const server = require('./app');
const port = process.env.PORT || 80;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
