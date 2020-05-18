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

const slimCheck = (req, res, next) => {
  let { timestamp, security_key } = req.headers;
  let { data, hash } = req.body;

  let partner = checkPartner(security_key);
  if (partner) {
    if (isNewPackage(timestamp) &&
      isOriginPackage(data, timestamp, hash, security_key, partner.encode_type)) {
      next();
    }
  }
  throw createError(400, "Bad request");
}

// TODO: Error ghi cái gì đây
const fullCheck = (req, res, next) => {
  let { timestamp, security_key } = req.headers;
  let { data, hash, signature } = req.body;
  let partner = checkPartner(security_key);
  if (partner) {
    if (isNewPackage(timestamp) &&
      isOriginPackage(data, timestamp, hash, security_key, partner.encode_type) &&
      verifySignature(data, signature, partner.public_key, partner.public_key_type)) {
      next();
    }
  }
  throw createError(400, "Bad request");
}

module.exports = {
  slimCheck,
  fullCheck
}