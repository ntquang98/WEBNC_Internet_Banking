const mongoose = require("mongoose");
let ResponseLog = mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'transaction'
  },
  transaction_number: String,
  partner_name: String,
  response_header: Object,
  response_body: Object,
  response_time: Number,
  signature: String
});

module.exports = ResponseLog = mongoose.model('response_log', ResponseLog, 'response_log');
