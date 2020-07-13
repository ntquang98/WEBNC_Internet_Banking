const mongoose = require("mongoose");

let Notification = mongoose.Schema({
  user_id: String,
  is_seen: { type: Boolean, default: false },
  type: String,
  content: String,
  create_at: { type: Number, default: Date.now() },
  is_hide: { type: Boolean, default: false }
});

module.exports = Notification = mongoose.model('notification', Notification, 'notification');
