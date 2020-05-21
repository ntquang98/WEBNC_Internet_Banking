const dataConfig = require('../config/default.json');
const moment = require('moment');
const crypto = require('crypto');
const openpgp = require('openpgp');
const Bank = require('./bank');
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
    let _data = JSON.stringify(data, null, 2);
    let hash = crypto.createHash(encodeType).update(timestamp + _data + securityKey).digest('hex');
    return sig == hash;

  },

  verifySignature: async (data, signature, publicKey, signatureEncode, publicKeyType) => {
    let _data = JSON.stringify(data, null, 2)
    if (publicKeyType === 'rsa') {
      return verifyRSA(_data, signature, signatureEncode, publicKey);
    }
    return await verifyPGP(_data, signature, publicKey);
  },

  encrypt: async (data, encodeType, privateKey, signature_format) => {
    const _data = JSON.stringify(data, null, 2);
    const sign = crypto.createSign(encodeType);
    sign.update(_data);
    return sign.sign(privateKey, signature_format);
  },
};

const verifyRSA = (data, signature, encodeType, publicKey) => {
  let verifier = crypto.createVerify(encodeType);
  verifier.update(data);
  let ver = verifier.verify(publicKey, signature, 'hex');
  return ver;
}

const verifyPGP = async (data, signature, publicKey) => {
  const verifier = await openpgp.verify({
    message: openpgp.cleartext.fromText(data),
    signature: openpgp.signature.readArmored(signature),
    publicKeys: (await openpgp.key.readArmored(publicKey)).keys
  });
  return verifier.signatures[0];
}