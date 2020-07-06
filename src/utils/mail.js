const nodemailer = require('nodemailer');

//const transporter = nodemailer.createTransport({
//service: 'Gmail',
//auth: {
//user: 'thnews8@gmail.com',
//pass: 'Quang123456'
//}
//});

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'aquarius.superstar@gmail.com',
    pass: 'jqocgqrosdporohs'
  }
})

module.exports = transporter;
