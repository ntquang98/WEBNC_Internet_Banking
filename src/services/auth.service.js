const User = require('../models/schema/user');
const UseRefreshTokenExt = require('../models/schema/useRefreshTokenExt');

const config = require('../config/default.json');

const jwt = require('jsonwebtoken');
const randToken = require('rand-token');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const sendEmail = require('../utils/sendEmail');
const { generateOneTimePassword } = require('../utils/generator');

const { generateAccessToken } = require('../utils/generator');

const login = async (user_name, password) => {
  try {
    let user = await User.findOne({ user_name });
    if (!user) throw createError[404];
    if (!bcrypt.compareSync(password, user.password)) throw createError[400];
    const accessToken = await generateAccessToken({ user_id: user._id, user_role: user.user_role });
    const refreshToken = randToken.generate(config.auth.refreshTokenSz);

    let useRefreshToken = await UseRefreshTokenExt.find({ user_id: user._id });
    if (useRefreshToken.length > 0) {
      await UseRefreshTokenExt.findOneAndUpdate({ user_id: user._id }, { refresh_token: refreshToken });
    } else {
      await UseRefreshTokenExt({
        user_id: user._id,
        refresh_token: refreshToken,
      }).save();
    }

    return {
      info: {
        receiver_list: user.receiver_list,
        accounts: user.accounts,
        user_id: user._id,
        user_name: user.user_name,
        full_name: user.full_name,
        user_role: user.user_role,
        email: user.email
      },
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw error;
  }
}

const refresh = async (accessToken, refreshToken) => {
  return jwt.verify(accessToken, config.auth.secret, { ignoreExpiration: true }, async (error, payload) => {
    if (error) {
      throw createError(400, "Invalid access token");
    }
    const { user_id, user_role } = payload;
    try {
      let useRefreshToken = await UseRefreshTokenExt.findOne({ user_id, refresh_token: refreshToken });
      if (!useRefreshToken) {
        throw createError(400, "Invalid refresh token");
      }
      const access_token = await generateAccessToken({ user_id, user_role });
      return {
        accessToken: access_token,
      }
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError[500];
    }
  });
}

const sendOTP = async (email, operation, mail_subject) => {
  try {
    let OTP = generateOneTimePassword(6);
    let exp = moment().unix() + 300;
    let user = await User.findOneAndUpdate({ email }, {
      otp: OTP,
      otp_exp: exp
    });
    console.log('user', user)
    if (!user) {
      throw createError(404, 'Can not find User');
    }
    await sendEmail(OTP, user, operation, mail_subject);
  } catch (error) {
    if (error.status)
      throw error;
    throw createError[500];
  }
}

const resetPassword = async (email, OTP, newPassword) => {
  try {
    let user = await User.findOne({ email, otp: OTP });
    if (!user) {
      throw createError(404);
    }
    if (user.otp_exp > moment().unix()) {
      throw createError(400, 'The OTP is now invalid');
    }
    let password = bcrypt.hashSync(newPassword, 8);
    let update = await User.findByIdAndUpdate(user._id, {
      password,
      otp: '',
      otp_exp: 0
    });
    return {
      success: true,
      user_id: update._id
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  login,
  refresh,
  sendOTP,
  resetPassword
}
