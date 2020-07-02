const mongoose = require('mongoose');

let Transaction = new mongoose.Schema({
  transaction_number: String,
  src_number: String,
  src_bank: String,
  des_number: String,
  des_bank: String,
  amount: Number,
  description: String,
  day: Number,
  fee: Number,
  transaction_type: {
    type: String,
    enum: ['TRANSFER', 'PAY_DEBT', 'SAVING', 'WITHDRAW'],
    default: 'TRANSFER'
  },
});

module.exports = Transaction = mongoose.model('transaction', Transaction, 'transaction');