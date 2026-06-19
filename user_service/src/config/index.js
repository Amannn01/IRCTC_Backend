require('dotenv').config();
const config = {
    SERVICE_NAME: require('../../package.json').name,

    PORT: Number(process.env.PORT) ,
    NODE_ENV: process.env.NODE_ENV ,
    LOG_LEVEL: process.env.LOG_LEVEL ,
    JWT_SECRET: process.env.JWT_SECRET,

    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,

    RESEND_OTP_API: process.env.RESEND_OTP_API,
    MAIL_SEND: process.env.MAIL_SEND,

    ACCESS_TOKEN_EXP: process.env.ACCESS_TOKEN_EXP , // in minutes
    REFRESH_TOKEN_EXP: process.env.REFRESH_TOKEN_EXP , // in days

    ACCESS_TOKEN_EXP_SEC: process.env.ACCESS_TOKEN_EXP_SEC,
    REFRESH_TOKEN_EXP_SEC: process.env.REFRESH_TOKEN_EXP_SEC,

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ,

    REDIS_USER_TTL: Number(process.env.REDIS_USER_TTL) , // in seconds

    OTP_TTL: Number(process.env.OTP_TTL) ,
    OTP_RATE_MAX_PER_HOUR: Number(process.env.OTP_RATE_MAX_PER_HOUR) ,
    OTP_MAX_VERIFY_ATTEMPTS: Number(process.env.OTP_MAX_VERIFY_ATTEMPTS) ,
    OTP_HMAC_SECRET: process.env.OTP_HMAC_SECRET

}

module.exports = { config };