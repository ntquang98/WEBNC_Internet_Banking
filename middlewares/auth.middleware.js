let jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const createError = require('http-errors');

module.exports = async (req, res, next) => {
  let accessToken = req.headers['x-access-token'];
  if (accessToken) {
    jwt.verify(accessToken, config.auth.secret, function (err, payload) {
      if (err)
        throw createError(401, err);
      // TODO: check user_role o day
      let { user_role } = payload;
      let [splat, ...role_path] = req.baseUrl;
      if (user_role != role_path.join('')) {
        throw createError(403, "not permission");
      }
      req.tokenPayload = payload;
      next();
    })
  } else {
    throw createError(401, 'No access token found');
  }
}