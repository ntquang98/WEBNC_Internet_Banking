const mongoose = require('mongoose');

const user = new mongoose.Schema({
  user_name: {type: String},
  password: {type: String},
  email: {type: String},
  dob: {type: String},
  user_role: {type: String},
  full_name: {type: String},
  phone_number: {type: String},
  receiver_list: {type: Array},
  accounts: [{type: mongoose.Schema.Types.ObjectId, ref: 'account'}],
  user_id: {type: String},
  otp: String,
  otp_exp: Number,
})

// eslint-disable-next-line no-undef
module.exports = mongoose.model('user', user, 'user');
