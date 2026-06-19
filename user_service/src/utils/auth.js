const crypto = require('crypto');
const {config} = require("../config");
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const {unauthorizedError} = require('../utils/error');

exports.hashToken = (refreshToken) => {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
}

exports.generateAccessToken = (userId) => {
    const payload = {id: userId};
    return jwt.sign(payload, config.JWT_SECRET,{expiresIn: config.ACCESS_TOKEN_EXP});
}
exports.generateRefreshToken = (userId) => {
    const payload = {id: userId,jti: crypto.randomUUID()};
    return jwt.sign(payload, config.JWT_SECRET,{expiresIn: config.REFRESH_TOKEN_EXP});
}

exports.verifyAccessToken = (accessToken) => {
    return jwt.verify(accessToken, config.JWT_SECRET);
}

exports.verifyRefreshToken = (refreshToken) => {
    return jwt.verify(refreshToken, config.JWT_SECRET);
}
