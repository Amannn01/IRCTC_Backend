const router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/refresh-token', authController.rotateRefreshToken);
module.exports = router;