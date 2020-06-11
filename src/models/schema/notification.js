const mongoose = require("mongoose");

let Notification = mongoose.Schema({
  user_id: String,
  is_seen: Boolean,
  type: String,
  content: String,
  create_at: Number,
  is_hide: Boolean
});

module.exports = Notification = mongoose.model('notification', Notification, 'notification');
