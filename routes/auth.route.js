const router = require('express').Router();
const jwt = require('jsonwebtoken');
const randToken = require('rand-token');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const { validate } = require('../middlewares/validation.middleware');
const { validationResult } = require('express-validator');
const config = require('../config/default.json');
const crypto = require('crypto');

const User = require('../models/schema/user');
const UseRefreshTokenExt = require('../models/schema/useRefreshTokenExt');

const { generateAccessToken } = require('../utils/generator');

const sendEmail = require('../utils/sendEmail');
const { totp } = require('otplib');

router.post('/login', validate('login'), async (req, res) => {
  // user_role
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).send({ errors: errors });
    return;
  }
  let { user_name, password, user_role } = req.body;
  try {
    let user = await User.findOne({ user_name, user_role });
    if (!user) {
      throw { status: 404, error: { message: "Cannot find user" } }
    }
    const hash = user.password;
    if (!bcrypt.compareSync(password, hash)) {
      throw { status: 401, error: { message: "Password is incorrect" } };
    }

    const accessToken = generateAccessToken({ user_id: user.id, user_role: user.user_role });
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
    res.status(200).send({
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.log(error);
    if (error.status) {
      throw createError(error.status, error);
    }
    throw createError(500, error);
  }
});

router.get('/refresh', async (req, res) => {
  const access_token = req.headers['x-access-token'];
  const refresh_token = req.headers['x-refresh-token'];
  jwt.verify(access_token, config.auth.secret, { ignoreExpiration: true }, async (error, payload) => {
    if (error) {
      res.status(400).send("Invalid access token");
      return;
    }
    const { user_id, user_role } = payload;
    try {
      let useRefreshToken = await UseRefreshTokenExt.findOne({ user_id, refresh_token });
      if (!useRefreshToken) {
        res.status(400).send("Invalid refresh token");
        return;
      }
      const accessToken = generateAccessToken({ user_id, user_role });
      res.status(200).send({ accessToken });
    } catch (error) {
      throw createError(500, error);
    }
  })
});

router.post('/reset_password', async (req, res) => {
  let { email } = req.body;
  try {
    let user = await User.findOne({ email });
    let id = user._id.toString();
    let secret = crypto.scryptSync(id, config.otp.secret, 10).toString('hex');
    let otp = await sendEmail(secret, user, "Reset password", "Your verification code for reset password");
    console.log(otp)

    res.status(302).send({
      message: "action need to be redirect and doing verify OTP",
      redirect: `/auth/verify/${secret}`
    });

  } catch (error) {
    console.log(error);
    throw createError(404, error);
  }
});

router.post('/verify/:secret', async (req, res) => {
  let { otp, email } = req.body;
  totp.options = {
    digits: 6,
    epoch: Date.now(),
    step: config.otp.expiresIns
  };
  let isValid = totp.check(otp, req.params.secret);
  if (!isValid) {
    res.status(400).send({ message: "OTP is not correct" });
  }
  try {
    let user = await User.findOne({ email });
    let secret = bcrypt.hashSync(user._id.toString(), 8);
    res.status(302).send({
      message: "action need final step to complete",
      redirect: `/auth/new_password`,
      token: secret
    });
  } catch (error) {
    res.status(404).send('NOT found email');
  }
})

router.post('/new_password', async (req, res) => {
  let { email, password, token } = req.body;
  try {
    let user = await User.findOne({ email });
    let isValid = bcrypt.compareSync(user._id.toString(), token);
    if (!isValid) {
      throw { status: 400, message: "Email is invalid" };
    }
    let update = await User.findByIdAndUpdate(user._id, { password: bcrypt.hashSync(password, 8) });
    res.status(200).send({ success: true, user_id: update._id, message: "Successfully update password" });
  } catch (error) {
    throw createError(error.status, error.message)
  }
})

module.exports = router;
