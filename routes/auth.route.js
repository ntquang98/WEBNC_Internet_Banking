const route = require('express').Router();
const jwt = require('jsonwebtoken');
const randToken = require('rand-token');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const { validate } = require('../middlewares/validation.middleware');
const { validationResult } = require('express-validator');
const config = require('../config/default.json');

const User = require('../models/schema/user');
const UseRefreshTokenExt = require('../models/schema/useRefreshTokenExt');

const { generateAccessToken } = require('../utils/generator');

route.post('/:user_role', validate('login'), async (req, res) => {
  // user_role
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).send({ errors: errors });
    return;
  }
  let user_role = req.params.user_role;
  let { user_name, password } = req.body;
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

route.get('/refresh', async (req, res) => {
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

module.exports = route;
