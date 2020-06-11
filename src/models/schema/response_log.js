const mongoose = require("mongoose");
let ResponseLog = mongoose.Schema({
  transaction_number: String,
  partner_name: String,
  response_header: Object,
  response_body: Object,
  response_time: Date,
  signature: String
});

module.exports = ResponseLog = mongoose.model('response_log', ResponseLog, 'response_log');