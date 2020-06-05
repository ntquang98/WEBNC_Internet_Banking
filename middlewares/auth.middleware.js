let jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const createError = require('http-errors');

module.exports = sys_user_role => async (req, res, next) => {
  let accessToken = req.headers['x-access-token'];
  if (accessToken) {
    jwt.verify(accessToken, config.auth.secret, function (err, payload) {
      if (err)
        throw createError(401, err);
      let { user_role } = payload;
      if (user_role != sys_user_role) {
        throw createError(403, "not permission");
      }
      req.tokenPayload = payload;
      next();
    })
  } else {
    throw createError(401, 'No access token found');
  }
}