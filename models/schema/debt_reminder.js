const mongoose = require("mongoose");

let DebtReminder = mongoose.Schema({
  account_number: String,
  sender_id: mongoose.Schema.Types.ObjectId,
  receiver_id: mongoose.Schema.Types.ObjectId,
  amount: Number,
  description: String,
  day: Date,
  is_done: Boolean,
  is_cancel: Boolean
});

module.exports = DebtReminder = mongoose.model('debt_reminder', DebtReminder, 'debt_reminder');
