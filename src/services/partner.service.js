const Bank = require('../models/schema/bank');
const MyBank = require('../models/schema/my_bank');

const openpgp = require('openpgp');
const CryptoJS = require('crypto-js');
const moment = require('moment');
const apiCaller = require('../utils/apiCaller');

const {
  url,
  partnerCode,
  passphrase,
  secret_key,
  privateKeyArmored
} = require('../config/nklbankconfig.json');

const createError = require('http-errors');
/**
     * {
     *    info: {
     *       msg: 'abcdef',
     *       ret: {
     *          fieldCount: 0,
     *          affectedRows: 1,
     *          insertId: 0,
     *          serverStatus: 34,
     *          warningCount: 0,
     *          message: '(Rows matched: 1  Changed: 1  Warnings: 0',
     *          protocol41: true,
     *          changedRows: 1
     *       }
     *    },
     *    sign: '\r\n' +
     *      '-----BEGIN PGP SIGNED MESSAGE-----\r\n' +
     *      'Hash: SHA512\r\n' +
     *      '\r\n' +
     *      '{"msg":"Transaction succeeded. Online contract stored with keyID = ebf559b848f3067d","ret":{"fieldCount":0,"affectedRows":1,"insertId":0,"serverStatus":34,"warningCount":0,"message":"(Rows matched: 1  Changed: 1  Warnings: 0","protocol41":true,"changedRows":1}}\r\n' +
     *      '-----BEGIN PGP SIGNATURE-----\r\n' +
     *      'Version: OpenPGP.js v4.10.4\r\n' +
     *      'Comment: https://openpgpjs.org\r\n' +
     *      '\r\n' +
     *      'wpwEAQEKAAYFAl7d3RkACgkQVY+hc4Qg8oItYQP/T2wixAdpmuRgCBBWU47X\r\n' +
     *      '456zT3BtCKlLgF6JZ/1WHbFfrcrg5iBjrAi/Mp9xAf5+89YpPH+673yyFU8i\r\n' +
     *      'o9YdPhrWa295shHhcxNNI9pGqPI4McmA0Yw5PB7nmv4vOa/L0Q9IGHDeUaOM\r\n' +
     *      'SOqI417BFo+Cwh0bgF6jUP4+D2lRwwo=\r\n' +
    *       '=LFh6\r\n' +
     *      '-----END PGP SIGNATURE-----\r\n'
     * }
     */
// data = { transaction_type: '+/-/?', source_account: '26348364', target_account: '87234934', amount_money: 293234424}

const _requestNKLBank = async (data) => {
  try {
    let timestamp = moment().toString();
    const hash = CryptoJS.AES.encrypt(
      JSON.stringify({ data, timestamp, secret_key }),
      secret_key
    ).toString();
    const _headers = {
      partner_code: partnerCode,
      timestamp,
      api_signature: hash,
    };
    console.log(_headers);
    let signed_data = null;

    if (data.transaction_type === "+") {
      const { keys: [privateKey] } = await openpgp.key.readArmored(privateKeyArmored);
      await privateKey.decrypt(passphrase);
      const { data: cleartext } = await openpgp.sign({
        message: openpgp.cleartext.fromText(JSON.stringify(data)), // CleartextMessage or Message object
        privateKeys: [privateKey], // for signing
      });
      signed_data = cleartext;
    }

    let response = await apiCaller(url, 'POST', _headers, { data, signed_data });

    let request = {
      partner_name: 'NKL Bank',
      request_uri: url,
      request_headers: _headers,
      request_body: JSON.stringify(data),
      request_time: moment().unix(),
      signature: signed_data,
      request_amount: data.amount_money,
    }
    let ret_response = {
      partner_name: 'NKL Bank',
      response_time: moment().unix(),
      response_header: response._headers,
      response_body: response.data.info,
      signature: response.data.sign
    }
    console.log(response)
    return response.data
  } catch (error) {
    throw createError(error.response.status, error.response.message);
  }
}

const requestInfoPartnerBank = async (account_number, bank_name) => {
  try {
    switch (bank_name) {
      case 'NKLBank': {
        let data = {
          transaction_type: '?',
          target_account: account_number
        };
        return await _requestNKLBank(data);
      }
    }
  } catch (error) {
    throw error;
  }
}

const sendMoneyToPartnerBank = async (source_account, target_account, amount_money, bank_name, description, feePayBySender, fee) => {
  try {
    switch (bank_name) {
      case 'NKLBank': {
        if (!feePayBySender) amount_money -= fee;
        let data = {
          transaction_type: '+',
          target_account,
          source_account,
          amount_money,
          note: description,
          charge_include: !feePayBySender
        };
        return await _requestNKLBank(data);
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  requestInfoPartnerBank,
  sendMoneyToPartnerBank
}
