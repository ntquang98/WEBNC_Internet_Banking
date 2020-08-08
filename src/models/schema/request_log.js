const mongoose = require("mongoose");

let RequestLog = mongoose.Schema({
  transaction_number: {type: String, ref: 'transaction', field: 'transaction_number'},
  partner_name: String,
  request_header: Object,
  request_body: Object,
  request_time: Number,
  signature: String,
  request_amount: Number
});
// partner gọi mình
module.exports = RequestLog = mongoose.model('request_log', RequestLog, 'request_log');
