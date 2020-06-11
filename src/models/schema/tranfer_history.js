const mongoose = require('mongoose');

const tranfer_history = new mongoose.Schema({
    account_id: { type: String },
    des_account: { type: String },
    code: { type: String },
    date: { type: String },
    content: { type: String },
    status: { type: String }
})

// eslint-disable-next-line no-undef
module.exports = mongoose.model('tranfer_history', tranfer_history, 'tranfer_history');