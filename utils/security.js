const dataConfig = require('../config/default.json');
const moment = require('moment');
const crypto = require('crypto');
const openpgp = require('openpgp');
const Bank = require('./bank');
const db = require('./db');

module.exports = {
  checkPartner: async (securityKey) => {
    if (securityKey) {
      let partner = await db.find({ model: Bank, data: { security_key: securityKey } });
      if (partner) {
        return partner;
      }
    }
    return null;
  },

  isNewPackage: (timestamp) => {
    return moment().unix() - timestamp <= 60
  },

  isOriginPackage: (data, timestamp, sig, securityKey, encodeType) => {
    let _data = JSON.stringify(data, null, 2);
    let hash = crypto.createHash(encodeType);
    let endCodeSecurity = hash.update(timestamp + _data + securityKey).digest('hex');
    return sig === endCodeSecurity
  },

  verifySignature: async (data, signature, publicKey, signatureEncode, publicKeyType) => {
    if (publicKeyType === 'rsa') {
      return verifyRSA(data, signature, signatureEncode, publicKey);
    }
    return await verifyPGP(data, signature, publicKey);
  }
};

const verifyRSA = (data, signature, encodeType, publicKey) => {
  let verifier = crypto.createVerify(encodeType);
  verifier.update(data);
  return verifier.verify(publicKey, signature, 'hex');
}

const verifyPGP = async (data, signature, publicKey) => {
  const verifier = await openpgp.verify({
    message: openpgp.cleartext.fromText(data),
    signature: openpgp.signature.readArmored(signature),
    publicKeys: (await openpgp.key.readArmored(publicKey)).keys
  });
  return verifier.signatures[0];
}