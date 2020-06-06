const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const moment = require('moment');

module.exports = {
  generateAccessToken: payload => {
    return jwt.sign(payload, config.auth.secret, {
      expiresIn: config.auth.expiresIn
    });
  },
  generateAccountNumber: _ => {
    const randomNumber = ~~(Math.random() * 15102017);
    const id = moment().unix() + randomNumber;
    return id.toString();
  },
  generateTransactionNumber: _ => {
    const randomNumber = ~~(Math.random() * 15102017);
    const id = moment().unix() + randomNumber;
    return 'TN' + id.toString();
  },

  generateOneTimePassword: numberOfDigits => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < numberOfDigits; i++) {
      OTP += digits[~~(Math.random() * 10)];
    }
    return OTP;
  }
}