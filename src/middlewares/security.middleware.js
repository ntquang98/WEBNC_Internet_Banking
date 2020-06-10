const { checkPartner, isNewPackage, isOriginPackage, verifySignature } = require('../utils/security');
const createError = require('http-errors');

const slimCheck = async (req, res, next) => {
  let { timestamp, security_key, hash } = req.headers;
  let { data } = req.params;

  let partner = await checkPartner(security_key);
  if (partner) {
    let { encode_type } = partner.attribute_data[0];
    if (isNewPackage(timestamp) &&
      isOriginPackage(data, timestamp, hash, security_key, encode_type)) {
      next();
    }
  } else {
    throw createError(400, "Bad request");
  }
}

const fullCheck = async (req, res, next) => {
  let { timestamp, security_key, hash } = req.headers;
  let { data, signature } = req.body;
  let partner = await checkPartner(security_key);
  if (partner) {
    let { encode_type, public_key_rsa, encrypt_type, signature_encode_type } = partner.attribute_data[0];
    let public_key = public_key_rsa.replace(/\\n/g, '\n');
    if (isNewPackage(timestamp) &&
      isOriginPackage(data, timestamp, hash, security_key, encode_type) &&
      verifySignature(data, signature, public_key, signature_encode_type, encrypt_type)) {
      next();
    }
  } else {
    throw createError(400, "Bad request");
  }
}

module.exports = {
  slimCheck,
  fullCheck
}