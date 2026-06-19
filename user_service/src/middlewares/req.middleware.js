const logger = require('../config/logger');

const reqLogger = (req, res, next) => {
    logger.debug(`Incoming request: ${req.method} ${req.originalUrl}`);
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Request: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    });

    next();
}

module.exports = { reqLogger };