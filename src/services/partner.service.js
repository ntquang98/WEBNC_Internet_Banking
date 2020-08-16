
const openpgp = require('openpgp');
const CryptoJS = require('crypto-js');
const moment = require('moment');
const apiCaller = require('../utils/apiCaller');

const ReceiverList = require('../models/schema/receiver_list');
const User = require('../models/schema/user');

const {
  url,
  partnerCode,
  passphrase,
  secret_key,
  privateKeyArmored
} = require('../config/nklbankconfig.json');

const createError = require('http-errors');

const eightBank = require('./partner/eight.service');
const mpBank = require('./partner/mp.service');
const qbanking = require('./partner/qbanking.service');
const threeTbank = require('./partner/3tbanking.service');

const _requestNKLBank = async (data) => {
  try {
    let timestamp = moment().toString();
    const hash = CryptoJS.AES.encrypt(
      JSON.stringify({data, timestamp, secret_key}),
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
      const {keys: [privateKey]} = await openpgp.key.readArmored(privateKeyArmored);
      await privateKey.decrypt(passphrase);
      const {data: cleartext} = await openpgp.sign({
        message: openpgp.cleartext.fromText(JSON.stringify(data)), // CleartextMessage or Message object
        privateKeys: [privateKey], // for signing
      });
      signed_data = cleartext;
    }

    let response = await apiCaller(url, 'POST', _headers, {data, signed_data});

    let request = {
      partner_name: 'NKL Bank',
      request_uri: url,
      request_headers: _headers,
      request_body: JSON.stringify(data),
      request_time: Date.now(),
      signature: signed_data,
      request_amount: data.amount_money,
    }
    let ret_response = {
      partner_name: 'NKL Bank',
      response_time: Date.now(),
      response_header: response._headers,
      response_body: response.data.info,
      signature: response.data.sign
    }
    console.log(response)
    return data.transaction_type === '?' ? response.data : {request, response: ret_response};
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
      case 'MPBank':
        return await mpBank.requestInfo(account_number);
      case 'qbanking':
        return await qbanking.getProfile(account_number);
      case '3TBank':
        return await threeTbank.getAccountInformation(account_number);
    }
  } catch (error) {
    console.log(error)
    throw error;
  }
}

const saveReceiverFromPartnerBank = async (user_id, account_number, name, bank) => {
  try {
    let receiver = await requestInfoPartnerBank(account_number, bank);
    if (!receiver) {
      throw createError(404, 'Account not found');
    }

    let saveReceiver = {
      name,
      user_id,
      account_number,
      bank_name: bank
    }

    let ret = await ReceiverList(saveReceiver);
    await User.findByIdAndUpdate(user_id, {$push: {receiver_list: ret._id}});
    return ret;
  } catch (error) {
    throw createError(500, error);
  }
}

const sendMoneyToPartnerBank = async (
  source_account,
  target_account,
  amount_money,
  bank_name,
  description,
  feePayBySender,
  fee,
  toFullName = null,
  user_id
) => {
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
      case 'Eight': {
        let transaction = {
          src_acc: source_account,
          des_acc: target_account,
          amount: amount_money,
          toFullName,
          isFeePayBySender: feePayBySender,
          fee: fee,
          transactionMessage: description
        }
        return await eightBank.sendMoney(user_id, transaction);
      }
      case 'MPBank': {
        let transaction = {
          src_acc: source_account,
          des_acc: target_account,
          amount: amount_money,
          description: description,
          feePayBySender,
          fee
        }
        return await mpBank.sendMoney(user_id, transaction);
      }
      case 'qbanking': {
        let data = {
          amount: amount_money,
          transactionMessage: description,
          account_number: target_account
        }
        return await qbanking.payIn(user_id, data);
      }
      case '3TBank': {
        let data = {
          amount: amount_money,
          account_number: target_account,
          feePayBySender,
          source: source_account,
        }
        return await threeTbank.sendMoney(user_id, data);
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  requestInfoPartnerBank,
  sendMoneyToPartnerBank,
  saveReceiverFromPartnerBank
}
