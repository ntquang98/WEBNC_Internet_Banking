const crypto = require('crypto');
const Bank = require('../models/schema/bank');
const moment = require('moment');
const openpgp = require('openpgp');

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
  },

  encryptData: async (strDataSend, partnerPublicKey) => {
    let {data: bodyData} = await openpgp.encrypt({
      message: openpgp.message.fromText(strDataSend),
      publicKeys: (await openpgp.key.readArmored(partnerPublicKey)).keys
    });
    return bodyData;
  },

  signPgp: async (strDataSend, myPrivateKey, passphrase) => {
    const {keys: [privateKeys]} = await openpgp.key.readArmored(myPrivateKey);
    await privateKeys.decrypt(passphrase);

    let {data: digital_sign} = await openpgp.sign({
      message: openpgp.cleartext.fromText(strDataSend),
      privateKeys: [privateKeys]
    });
    digital_sign = digital_sign.replace(/\r/g, "\\n").replace(/\n/g, "")
    return digital_sign;
  }
};

