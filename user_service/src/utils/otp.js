const crypto = require('crypto');
const otpGenerator = require('otp-generator');
require('dotenv').config();
const { config } = require('../config');
const { TooManyRequestsError } = require('../utils/error');
const { redis } = require('../config/redis');
const HMAC_SECRET = config.OTP_HMAC_SECRET;
const RATE_MAX_PER_HOUR = parseInt(config.OTP_RATE_MAX_PER_HOUR || "5", 10);
const OTP_TTL = parseInt(config.OTP_TTL || "300", 10);
const { badRequestError } = require("./error");

function hmacFor(email, otp) {
    return crypto.createHmac('sha256', HMAC_SECRET).update(`${email}:${otp}`).digest('hex');
}

async function generateAndStoreOTP(meta) {
    const ratekey = `otp_rate:${meta.email}`;
    const currentRate = parseInt(await redis.get(ratekey) || "0", 10);
    if (currentRate >= config.OTP_RATE_MAX_PER_HOUR) {
        throw new TooManyRequestsError("OTP request limit exceeded. Please try again later.",);
    }
    //otp generation logic
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false, digits: true, lowerCase: false });

    // otpSessionId generation
    const otpSessionId = crypto.randomUUID();

    // otp hashing and storing in redis with metadata
    const hashed = hmacFor(meta.email, otp)
    // console.log("GENERATED OTP SESSION =>", otpSessionId);
    await redis.set(`otp:session:${otpSessionId}`, JSON.stringify({ hashedOtp: hashed, meta }), 'EX', config.OTP_TTL);
    const saved = await redis.get(`otp:session:${otpSessionId}`);
    // console.log("AFTER SAVE =>", saved);

    // increment rate limit counter
    await redis.incr(ratekey);
    await redis.expire(ratekey, 3600)
    return { otp, otpSessionId };
}


async function verifyOTPStoreOTP(otpSessionId, otp) {
    // const rawData = await redis.get(`otp:session:${otpSessionId}`);

    // console.log("VERIFYING SESSION =>", otpSessionId);

    const key = `otp:session:${otpSessionId}`;

    const rawData = await redis.get(key);

    // console.log("REDIS KEY =>", key);
    // console.log("REDIS DATA =>", rawData);

    const ttl = await redis.ttl(key);  
    // console.log("TTL =>", ttl);

    if (!rawData) {
        throw new badRequestError("Invalid or expired OTP session");
    }
    const { hashedOtp: storedOtp, meta } = JSON.parse(rawData);
    const attemptskey = `otp_attempts:${meta.email}`;
    const currentAttempts = parseInt(await redis.get(attemptskey) || "0", 10);
    if (currentAttempts >= config.OTP_MAX_VERIFY_ATTEMPTS) {
        throw new TooManyRequestsError("Maximum OTP verification attempts exceeded. Please request a new OTP.");
    }
    const hashedInputOtp = hmacFor(meta.email, otp);
    if (crypto.timingSafeEqual(Buffer.from(hashedInputOtp, 'hex'), Buffer.from(storedOtp, 'hex'))) {
        // console.log("OTP VERIFICATION SUCCESSFUL =>", otpSessionId);
        await redis.del(`otp:session:${otpSessionId}`, attemptskey);
        await redis.del(`otp:rate:${meta.email}`);
        return meta;
    } else {
        await redis.incr(attemptskey);
        await redis.expire(attemptskey, config.OTP_TTL);
        throw new badRequestError("Invalid OTP");
        return null;
    }
}

module.exports = { generateAndStoreOTP, verifyOTPStoreOTP };



