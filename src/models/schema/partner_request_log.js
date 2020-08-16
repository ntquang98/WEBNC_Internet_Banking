const mongoose = require('mongoose');
let PartnerRequestLog = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'transaction'
  },
  transaction_number: String,
  partner_name: String,
  request_uri: String,
  request_header: Object, // nên là String hay là để object
  request_body: Object,
  request_time: Number, // timestamp
  signature: String,
  request_amount: Number
});
// partner lÀ mình gọi partner trả lời
module.exports = PartnerRequestLog = mongoose.model('partner_request_log', PartnerRequestLog, 'partner_request_log');
