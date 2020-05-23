const mongoose = require('mongoose');

const account = new mongoose.Schema({
    account_number: { type: String },
    account_id: { type: String },
    account_type: { type: String },
    account_value: { type: Number },
    user_id: { type: String }
})

// eslint-disable-next-line no-undef
module.exports = Account = mongoose.model('account', account, 'account');