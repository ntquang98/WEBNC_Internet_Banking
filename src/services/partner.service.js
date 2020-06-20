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

const eightBank = require('./partner/eight.service');

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
    return data.transaction_type === '?' ? response.data : { request, response: ret_response };
  } catch (error) {
    throw createError(error.response.status, error.response.message);
  }
}

const requestInfoPartnerBank = async (account_number, bank_name) => {
  try {
    switch (bank_name) {
      case 'NKLBank':
        let data = {
          transaction_type: '?',
          target_account: account_number
        };
        return await _requestNKLBank(data);
      case 'Eight':
        return await eightBank.requestInfo(account_number);
    }
  } catch (error) {
    throw error;
  }
}

const sendMoneyToPartnerBank = async (source_account, target_account, amount_money, bank_name, description, feePayBySender, fee, toFullName = null, user_id) => {
  try {
    switch (bank_name) {
      case 'NKLBank':
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
      case 'Eight': {
        let transaction = {
          src_acc: source_account,
          des_acc: target_account,
          amount: amount_money,
          toFullName
        }
        return await eightBank.sendMoney(user_id, transaction);
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
