const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { sentOtpEmail } = require("../utils/email");
const { badRequestError, conflictError, forbiddenError, unauthorizedError } = require("../utils/error");
const { generateAndStoreOTP, verifyOTPStoreOTP } = require("../utils/otp");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/auth");
const { prisma } = require("../config/prisma");
const { redis } = require('../config/redis');
const { config } = require("../config");
const {OAuth2Client, GoogleAuth} = require("google-auth-library");
const client = new OAuth2Client(config.Google_Client_id);


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

const verifyByGoogleIdToken = async(idtoken)=>{
    const ticket = await client.verifyIdToken({
        idToken,
        audience:config.Google_Client_id
    })
    const payload = ticket.getPayload();
    if(!payload.sub || !payload.email){
        throw new unauthorizedError("Invalid Google Token Payload")
    }
    const googleUser = {
        provider:payload.iss,
        providerId:payload.sub,
        email:payload.email,
        firstname:payload.given_name,
        lastname:payload.family_name,
        emailVerified:payload.email_verified || false
    } 

    const user = await prisma.$transaction(async(tx)=>{
        let googleAuth = await tx.authProvider.findUnique({
            where:{
                provider_providerId:{
                    provider:googleUser.provider,
                    providerId:googleUser.providerId
                }
            },include:{user:true}
        })
        if(GoogleAuth){
            return googleAuth.user;
        }
        let existingUser = await tx.user.findUnique({
            where:{email:googleAuth.email}
        })
        if(existingUser){
            await tx.authProvider.create({
                data:{
                    provider:googleUser.provider,
                    providerId:googleUser.providerId,
                    userId:existingUser.id
                }
            })
            return existingUser;
        }
        return await tx.user({
            data:{
                email:googleUser.email,
                firstname:googleUser.firstname,
                lastname:googleUser.lastname,
                emailVerified:googleUser.emailVerified,
                authProvider:{
                    provider:googleUser.provider,
                    providerId:googleUser.providerId
                }
            }
        })
    })
    const accessToken = generateAccessToken(user.id);
    const refreshToken= generateRefreshToken(user.id)
     const { jti } = jwt.decode(refreshToken);
    await redis.set(`refresh:${user.id}:${deviceId}`, jti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
    const { password: _password, ...safeUser } = user;
    await redis.set(`user:${user.id}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL);
    return {accessToken,refreshToken,loggedInUser:safeUser}
}

module.exports = { sendOTP, verifyOTP, loginUser, rotate_RefreshToken,verifyByGoogleIdToken };