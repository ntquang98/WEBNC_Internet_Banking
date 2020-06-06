const mailTransporter = require('./mail');
const mailContent = require('./mailContent');
const nodemailer = require('nodemailer');
require('dotenv').config();

(async function () {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'thnews8@gmail.com',
      pass: 'Quang123456'
    }
  })
  let content = mailContent("Quang", 123456, "reset password");
  const mailOptions = {
    from: '"S2Q Bank" <no-reply@s2qbanking.com>',
    to: "aquarius.superstar@gmail.com",
    subject: "reset password",
    html: content
  };
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log(info.messageId)
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.log(error);
  }
})();
