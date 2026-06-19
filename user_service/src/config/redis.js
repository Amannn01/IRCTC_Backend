const Redis = require('ioredis');
const { config } = require('.');
const logger = require('./logger');

class RedisClient {
    static instance;
    static isConnected = false;

    constructor() {

    }
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis(config.REDIS_URL, {
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    logger.warn(`Redis connection lost. Retrying in ${delay}ms...`);
                    return delay;
                },
                maxRetriesPerRequest: 3,
            });
            RedisClient.setupEventHandlers();
        }
        return RedisClient.instance;
    }

    static setupEventHandlers() {
        RedisClient.instance.on('connect', () => {
            RedisClient.isConnected = true;
            logger.info('Connected to Redis');
        });
        RedisClient.instance.on('error', (err) => {
            RedisClient.isConnected = false;
            logger.error(`Redis connection error: ${err.message}`);
        });
        RedisClient.instance.on('end', () => {
            RedisClient.isConnected = false;
            logger.warn('Redis connection closed');
        });
        RedisClient.instance.on('reconnecting', (delay) => {
            RedisClient.isConnected = false;
            logger.warn(`Reconnecting to Redis in ${delay}ms...`);
        });
        RedisClient.instance.on('ready', () => {
            RedisClient.isConnected = true;
            logger.info('Redis connection is ready');
        });
        RedisClient.instance.on('close', () => {
            RedisClient.isConnected = false;
            logger.warn('Redis connection closed');
        });
    }
    static async closeConnection() {
        if (RedisClient.instance) {
            try {
                await RedisClient.instance.quit();
                logger.info('Redis connection closed gracefully');
            } catch (error) {
                logger.error(`Error occurred while closing Redis connection: ${error.message}`);
            }
        }
    }
    static isReady() {
        return RedisClient.isConnected;
    }
    static async testConnection() {
        try {
            await RedisClient.Instance().ping();
            logger.info('Redis connection test successful');
            return true;
        } catch (error) {
            logger.error(`Redis connection test failed: ${error.message}`);
            return false;
        }
    }
}

module.exports = {
    redis: RedisClient.getInstance(),
    RedisClient
};