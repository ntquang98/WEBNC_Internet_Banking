const mongoose = require('mongoose');

let bank = new mongoose.Schema({
  bank_name: String,
  security_key: String, // out secret 
  public_key: String, // public key for encrypt, decrypt
  encode_type: String, // md5, sha256, sha512
  encrypt_type: String, // sra, pgp
  signature_format: String, // hex, base64, 
  signature_encode_type: String, // md5, sha256, sha512,
  key_length: Number,
  passphrase: String, // option for pgp crypt
  private_key: String // test purpose
});


// eslint-disable-next-line no-undef
module.exports = Bank = mongoose.model('bank', bank, 'bank');