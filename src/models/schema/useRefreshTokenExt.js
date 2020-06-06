const mongoose = require("mongoose");

let UseRefreshTokenExt = mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  refresh_token: String,
  expired_day: Date,
});

module.exports = UseRefreshTokenExt = mongoose.model('useRefreshTokenExt', UseRefreshTokenExt, 'useRefreshTokenExt');
