const server = require('./app');
const logger = require('./utilities/logger');

const port = process.env.PORT || 80;

server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
