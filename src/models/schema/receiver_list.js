const mongoose = require("mongoose");

let ReceiverList = mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId },
  name: String,
  account_number: String,
  bank_name: { type: String, default: "S2Q Bank" }
});

module.exports = ReceiverList = mongoose.model('receiver_list', ReceiverList, 'receiver_list');