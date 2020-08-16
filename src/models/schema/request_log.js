const mongoose = require("mongoose");

let RequestLog = mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'transaction'
  },
  transaction_number: {type: String},
  partner_name: String,
  request_header: Object,
  request_body: Object,
  request_time: Number,
  signature: String,
  request_amount: Number
});
// partner gọi mình
module.exports = RequestLog = mongoose.model('request_log', RequestLog, 'request_log');
