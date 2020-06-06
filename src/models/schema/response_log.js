const mongoose = require("mongoose");
let ResponseLog = mongoose.Schema({
  transaction_number: String,
  partner_name: String,
  response_header: String,
  response_body: String,
  response_time: Date,
  signature: String
});

module.exports = ResponseLog = mongoose.model('response_log', ResponseLog, 'response_log');