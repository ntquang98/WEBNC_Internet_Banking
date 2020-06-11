const moment = require('moment');
const crypto = require('crypto');
const Bank = require('../models/schema/bank');
const db = require('./db');

module.exports = {
  checkPartner: async (securityKey) => {
    if (securityKey) {
      try {
        let partner = await db.find({ model: Bank, data: { security_key: securityKey } });
        if (partner) {
          return partner;
        }
      } catch (err) {
        return null;
      }
    }
    return null;
  },

  isNewPackage: (timestamp) => {
    return moment().unix() - timestamp <= 60
  },

  isOriginPackage: (data, timestamp, sig, securityKey, encodeType) => {
    let _data = JSON.stringify(data);
    let hash = crypto.createHash(encodeType).update(timestamp + _data + securityKey).digest('hex');
    return sig == hash;

  },

  verifySignature: (data, signature, publicKey) => {
    let _data = JSON.stringify(data);
    let verifier = crypto.createVerify('sha256');
    verifier.update(_data);
    return verifier.verify(publicKey, signature, 'hex');
  },

  encrypt: (data, encodeType, privateKey, signature_format) => {
    const _data = JSON.stringify(data, null, 2);
    const sign = crypto.createSign(encodeType);
    sign.update(_data);
    return sign.sign(privateKey, signature_format);
  }
};

