const mongoose = require("mongoose");

let RequestLog = mongoose.Schema({
  transaction_number: String,
  partner_name: String,
  request_header: Object,
  request_body: Object,
  request_time: Number,
  signature: String,
  request_amount: Number
});

module.exports = RequestLog = mongoose.model('request_log', RequestLog, 'request_log');
