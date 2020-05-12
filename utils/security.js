import dataConfig from '../config';
const moment = require('moment');
const crypto = require('crypto');

module.exports = {
  checkPartner: (securityKey) => {
    if (securityKey) {
      let partnerArray = dataConfig ? dataConfig.partner : [];
      if (Array.isArray(partnerArray) && partnerArray.length > 0) {
        let partner = partnerArray.filter((item) => {
          return item.securityKey == securityKey;
        })
        if (Array.isArray(partner) && partner.length > 0) return partner[0];
      }
    }
    return false;
  },

  isPackageNew: (timestamp) => {
    return moment().unix() - timestamp <= 60
  },

  isOriginPackage: (data, timestamp, sig, securityKey) => {
    let _data = JSON.stringify(data, null, 2);
    let endCodeSecurity = md5(timestamp + _data + securityKey);
    return sig == endCodeSecurity
  },

  verifySignature: (data, signature, publicKey, signatureEncode) => {
    const verify = crypto.createVerify(signatureEncode);
    verify.write(data);
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
  }
};
