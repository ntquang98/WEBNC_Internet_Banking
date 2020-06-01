const mongoose = require('mongoose');

const account = new mongoose.Schema({
    account_number: { type: String },
    account_id: { type: String },
    account_type: { type: String, default: "save" },
    amount: { type: Number, default: 0 },
    account_name: { type: String },// tên khoản tiết kiệm
    user_id: { type: mongoose.Schema.Types.ObjectId }
})

// eslint-disable-next-line no-undef
module.exports = Account = mongoose.model('account', account, 'account');