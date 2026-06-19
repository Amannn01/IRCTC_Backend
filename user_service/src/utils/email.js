const {config} = require('../config');
const { Resend } = require('resend');
require('dotenv').config();
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const resend = new Resend(config.RESEND_OTP_API);
const minutes = (config.OTP_TTL || 300) / 60;


async function sentOtpEmail(email, otp) {
   try {
        const response = await resend.emails.send({
            from: config.MAIL_SEND,
            to: email,
            subject: 'Your IRCTC VERIFICATION OTP Code',
            text: `Your OTP code is ${otp}. It will expire in ${minutes} minutes.`,
            html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in ${minutes} minutes.</p>`
        });

        console.log("RESEND RESPONSE:", response);

    } catch (error) {
        console.error("RESEND ERROR:", error);
        throw error;
    }
}

module.exports = { sentOtpEmail }