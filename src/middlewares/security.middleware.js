const {checkPartner, isNewPackage, isOriginPackage, verifySignature} = require('../utils/security');
const createError = require('http-errors');

const slimCheck = async (req, res, next) => {
  let {timestamp, security_key, hash} = req.headers;
  let {account_number} = req.params;

  let partner = await checkPartner(security_key);
  if (partner) {
    let {encode_type} = partner;
    if (isNewPackage(timestamp) &&
      isOriginPackage(account_number, timestamp, hash, security_key, encode_type)) {
      next();
    } else {
      throw createError(400, 'Bad request');
    }
  } else {
    throw createError(400, "Bad request");
  }
}

const fullCheck = async (req, res, next) => {
  let {timestamp, security_key, hash} = req.headers;
  let {data, signature} = req.body;
  let sourceBankName = data.source_bank
  let partner = await checkPartner(security_key, sourceBankName);

  if (partner) {
    let {encode_type, public_key_rsa} = partner;
    let public_key = public_key_rsa.replace(/\\n/g, '\n');
    console.log(public_key)
    if (isNewPackage(timestamp) &&
      isOriginPackage(data, timestamp, hash, security_key, encode_type) &&
      verifySignature(data, signature, public_key)) {
      next();
    } else {
      console.log('sai key');
      throw createError(400, 'Bad Request')
    }
  } else {
    console.log('khong phai partner')
    throw createError(400, "Bad request");
  }
}

module.exports = {
  slimCheck,
  fullCheck
}
