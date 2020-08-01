const crypto = require('crypto');
const Bank = require('../models/schema/bank');
const moment = require('moment');

module.exports = {
  checkPartner: async (securityKey, bankName = null) => {
    if (securityKey) {
      try {
        let partner = bankName ?
          await Bank.findOne({security_key: securityKey, bank_name: bankName}) :
          await Bank.findOne({security_key: securityKey});
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
    let v = sig == hash;
    console.log('isOriginPackage', v);
    return v;
  },

  verifySignature: (data, signature, publicKey) => {
    let _data = JSON.stringify(data);
    let verifier = crypto.createVerify('sha256');
    verifier.update(_data);
    let v = verifier.verify(publicKey, signature, 'hex');
    console.log('true Signature', v);
    return v;
  },

  encrypt: (data, encodeType, privateKey, signature_format) => {
    const _data = JSON.stringify(data, null, 2);
    const sign = crypto.createSign(encodeType);
    sign.update(_data);
    return sign.sign(privateKey, signature_format);
  }
};

