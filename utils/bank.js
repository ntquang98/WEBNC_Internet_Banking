const mongoose = require('mongoose');

let bank = new mongoose.Schema({
  bank_name: { type: String, required: true },
  security_key: { type: String, required: true }, // out secret 
  public_key: { type: String, required: true }, // public key for encrypt, decrypt
  encode_type: { type: String, required: true }, // md5, sha256, sha512
  encrypt_type: { type: String, required: true }, // sra, pgp
  signature_format: { type: String, required: true }, // hex, base64, 
  signature_encode_type: { type: String, required: true }, // md5, sha256, sha512,
  key_length: Number,
  passphrase: String, // option for pgp crypt
  private_key: String // test purpose
});


// eslint-disable-next-line no-undef
module.exports = Bank = mongoose.model('bank', bank, 'bank');