const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { sentOtpEmail } = require("../utils/email");
const { badRequestError, conflictError, forbiddenError } = require("../utils/error");
const { generateAndStoreOTP, verifyOTPStoreOTP } = require("../utils/otp");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/auth");
const { prisma } = require("../config/prisma");
const { redis } = require('../config/redis');
const { config } = require("../config");


const sendOTP = async (firstname, lastname, email, password) => {
    const existingUser = await prisma.user.findUnique({ where: { email: meta.email } })
    if (existingUser) {
        throw new conflictError("user as already existing")
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const meta = { firstname: firstname, lastname: lastname, email, password: hashedPassword };
    const { otp, otpSessionId } = await generateAndStoreOTP(meta);
    await sentOtpEmail(email, otp);
    return { otpSessionId };
}

const verifyOTP = async (otpSessionId, otp) => {
    const meta = await verifyOTPStoreOTP(otpSessionId, otp);
    if (meta === null) {
        throw new badRequestError("Invalid OTP");
    }
    const user = await prisma.user.create({
        data: {
            firstname: meta.firstname,
            lastname: meta.lastname,
            email: meta.email,
            password: meta.password,
            emailVerified: true
        }
    });
    return user;
}

const loginUser = async (email, password, deviceId) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
        throw new badRequestError("Invalid email || Email not registered");
    }
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
        throw new badRequestError("Invalid password || Password does not match");
    }
    // Generate access and refresh tokens
    // Return tokens and user info
    const accessToken = generateAccessToken(existingUser.id);
    const refreshToken = generateRefreshToken(existingUser.id);
    const { jti } = jwt.decode(refreshToken);
    await redis.set(`refresh:${existingUser.id}:${deviceId}`, jti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
    const { password: _password, ...safeUser } = existingUser;
    await redis.set(`user:${existingUser.id}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL);
    return { accessToken, refreshToken, loggedInUser: safeUser };

}

const rotate_RefreshToken = async (refreshToken, deviceId) => {

    console.log("REFRESH TOKEN =>", refreshToken);
    const decoded = jwt.decode(refreshToken);
    console.log("DECODED =>", decoded);

    const payload = verifyRefreshToken(refreshToken);
    const { id: userId, jti } = payload;
    const storedJti = await redis.get(`refresh:${userId}:${deviceId}`);
    if (!storedJti) {
        throw new forbiddenError("Invalid refresh token, Session may have expired or been revoked");
    }
    if (storedJti !== jti) {
        await redis.del(`refresh:${userId}:${deviceId}`);
        throw new forbiddenError("Refresh token is reused");
    }
    const newAccessToken = generateAccessToken(payload.id);
    const newRefreshToken = generateRefreshToken(payload.id);
    const { jti: newJti } = jwt.decode(newRefreshToken);
    await redis.set(`refresh:${payload.id}:${deviceId}`, newJti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
    return { newAccessToken, newRefreshToken };

}

module.exports = { sendOTP, verifyOTP, loginUser, rotate_RefreshToken };