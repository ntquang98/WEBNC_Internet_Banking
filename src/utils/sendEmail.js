const mailTransporter = require('./mail');
const mailContent = require('./mailContent');
const createError = require('http-errors');

const sendEmail = async (otp, user, operation, subject) => {
  const { full_name, email } = user;
  const content = mailContent(full_name, otp, operation);
  const mailOptions = {
    from: '"S2Q Bank" <no-reply@s2qbanking.com>',
    to: email,
    subject: subject,
    html: content
  };
  try {
    await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    throw createError(500, 'Server Errors');
  }
};

module.exports = sendEmail;