const mongoose = require("mongoose");

let PartnerResponseLog = mongoose.Schema({
  transaction_number: String,
  partner_name: String,
  response_time: Date,
  response_header: String,
  response_body: String,
  signature: String
});

module.exports = PartnerResponseLog = mongoose.model('partner_response_log', PartnerResponseLog, 'partner_response_log');