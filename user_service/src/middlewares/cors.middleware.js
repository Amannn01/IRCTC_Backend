const cors = require('cors');
const {config} = require('../config');

const corsMiddleware = cors({
    origin: config.ALLOWED_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Accept', 'Content-Type', 'Authorization', 'X-Requested-With'],
});

module.exports = { corsMiddleware };