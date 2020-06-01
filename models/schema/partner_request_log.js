const mongoose = require('mongoose');
let PartnerRequestLog = new mongoose.Schema({
  transaction_number: String,
  partner_name: String,
  request_uri: String,
  request_header: String, // nên là String hay là để object
  request_body: String,
  request_time: Date,
  signature: String,
  request_amount: Number
});

module.exports = PartnerRequestLog = mongoose.model('partner_request_log', PartnerRequestLog, 'partner_request_log');