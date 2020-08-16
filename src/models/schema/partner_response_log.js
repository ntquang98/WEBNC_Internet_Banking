const mongoose = require("mongoose");

let PartnerResponseLog = mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'transaction'
  },
  transaction_number: String,
  partner_name: String,
  response_time: Number,
  response_header: Object,
  response_body: Object,
  signature: String
});

module.exports = PartnerResponseLog = mongoose.model('partner_response_log', PartnerResponseLog, 'partner_response_log');
