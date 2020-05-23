const { checkPartner, isNewPackage, isOriginPackage, verifySignature } = require('../utils/security');

const createError = require('http-errors');
/**
 * req
 *  header:{
 *    timestamp: 
 *    security_key:
 * },
 * body: {
 *    data: {
 *      "account_number":"",
 *      "amount": 1000000  
 *    },
 *    hash: "",
 *    signature:
 * }
 */

const slimCheck = async (req, res, next) => {
  let { timestamp, security_key } = req.headers;
  let { data, hash } = req.body;

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
  let { timestamp, security_key } = req.headers;
  let { data, hash, signature } = req.body;
  let partner = await checkPartner(security_key);
  if (partner) {
    let { encode_type, public_key, public_key_type } = partner.attribute_data[0];
    public_key = public_key.replace(/\\n/g, '\n');
    if (isNewPackage(timestamp) &&
      isOriginPackage(data, timestamp, hash, security_key, encode_type) &&
      verifySignature(data, signature, public_key, public_key_type)) {
      next();
    }
  }
  throw createError(400, "Bad request");
}

module.exports = {
  slimCheck,
  fullCheck
}