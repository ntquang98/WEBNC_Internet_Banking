const mongoose = require('mongoose');
let my_bank = new mongoose.Schema({
  bank_name: String,
  public_key_rsa: String,
  private_key_rsa: String,
  public_key_pgp: String,
  private_key_pgp: String,
  key_length: Number,
  crypt_type: String,
  secret_key: String,
  pgp_passphrase: String
});


// eslint-disable-next-line no-undef
module.exports = MyBank = mongoose.model('my_bank', my_bank, 'my_bank');