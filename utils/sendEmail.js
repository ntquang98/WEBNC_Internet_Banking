const mailTransporter = require('./mail');
const mailContent = require('./mailContent');
const { totp } = require('otplib');
const config = require('../config/default.json');

// TODO: Reset password.- -> done
// TODO: Thanh toán nợ
// TODO: chuyển tiền

const sendEmail = async (secret, user, operation, subject) => {
  const { full_name, email } = user;
  totp.options = {
    digits: 6,
    epoch: Date.now(),
    step: config.otp.expiresIns
  };
  const otp = totp.generate(secret);
  const content = mailContent(full_name, otp, operation);
  const mailOptions = {
    from: '"S2Q Bank" <no-reply@s2qbanking.com>',
    to: email,
    subject: subject,
    html: content
  };
  try {
    await mailTransporter.sendMail(mailOptions);
    return otp;
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;