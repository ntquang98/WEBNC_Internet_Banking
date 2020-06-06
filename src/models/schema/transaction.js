const mongoose = require('mongoose');

let Transaction = new mongoose.Schema({
  transaction_number: String,
  src_number: String,
  src_bank: String,
  des_number: String,
  des_bank: String,
  amount: Number,
  description: String,
  day: Date,
  fee: Number,
  transaction_type: String,
});

module.exports = Transaction = mongoose.model('transaction', Transaction, 'transaction');