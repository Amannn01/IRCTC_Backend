const { badRequestError, unauthorizedError } = require("../utils/error");
const asyncHandler = require("../utils/asyncHandler");
const { sendOTP, verifyOTP, loginUser, rotate_RefreshToken, verifyByGoogleIdToken } = require("../services/auth.service");
const { config } = require('../config');
const { getDeviceFingerprint } = require('../utils/deviceFingerprint');


const sendOtp = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password, confirmPassword } = req.body;
    if (!firstname || !lastname || !email || !password || !confirmPassword) {
        throw new badRequestError("All fields are required");
    }
    if (password !== confirmPassword) {
        throw new badRequestError("Password and confirm password do not match");
    }

    const { otpSessionId } = await sendOTP(firstname, lastname, email, password);

    res.cookie('otpSessionId', otpSessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.OTP_TTL * 1000
    }).status(200).json({ success: true, message: "OTP sent to email" });
})

const verifyOtp = asyncHandler(async (req, res) => {
    const { otp, otpSessionId } = req.body;
    // const {otpSessionId} = req.cookies.otpSessionId;

    if (!otp || !otpSessionId) {
        throw new badRequestError("OTP and OTP session ID are required");
    }

    const user = await verifyOTP(otpSessionId, otp);
    res.clearCookie('otpSessionId');
    res.status(201).json({ success: true, message: "OTP verified successfully", user });
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new badRequestError("Email and password are required");
    }
    const deviceId = getDeviceFingerprint(req);

    const { accessToken, refreshToken, loggedInUser } = await loginUser(email, password, deviceId);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.ACCESS_TOKEN_EXP_SEC * 1000
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.REFRESH_TOKEN_EXP_SEC * 1000
    }).status(200).json({ success: true, message: "Login successful", loggedInUser });
})

const rotateRefreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        throw new unauthorizedError("Refresh token is required");
    }
    const deviceId = getDeviceFingerprint(req);
    const { newAccessToken, newRefreshToken } = await rotate_RefreshToken(refreshToken, deviceId);
    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.ACCESS_TOKEN_EXP_SEC * 1000
    });
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.REFRESH_TOKEN_EXP_SEC * 1000
    }).status(200).json({ success: true, message: "Tokens rotated successfully" });
})

const verifyGoogleIdToken = asyncHandler(async (req, res) => {
    const { idtoken } = req.body;
    if (!idtoken) {
        throw new badRequestError("Invalid Google ID Token", "Invalid Token")
    }
    const deviceId = getDeviceFingerprint(req)
    const { accessToken, refreshToken, loggedInUser } = await verifyByGoogleIdToken(idtoken, deviceId);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.ACCESS_TOKEN_EXP_SEC * 1000
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.REFRESH_TOKEN_EXP_SEC * 1000
    }).status(200).json({ success: true, message: "logged successful", loggedInUser });

})

module.exports = { sendOtp, verifyOtp, login, rotateRefreshToken,verifyGoogleIdToken };