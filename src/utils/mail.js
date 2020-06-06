const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'thnews8@gmail.com',
    pass: 'Quang123456'
  }
});

module.exports = transporter;