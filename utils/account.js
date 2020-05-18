const mongoose = require('mongoose');

const account = new mongoose.Schema({
    account_number:{type: String},
    account_balance:{type: String},
    account_type:{type: String},
    user_id: {type: String}
})

module.exports = Account = mongoose.model('taikhoan', account, 'taikhoan');