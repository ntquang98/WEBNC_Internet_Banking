const axios = require('axios');
const MyBank = require('../../models/schema/my_bank');
const User = require('../../models/schema/user');
const md5 = require('md5');
const NodeRSA = require('node-rsa');

const partnerCode = 'S2Q Bank'; //'S2QBank';
const secretKey = 'secretkey';
const host = `https://ibs-api.herokuapp.com`;

const getAccountInformation = async accountNumber => {
  try {
    const ts = Date.now();

    const options = {
      method: 'GET',
      url: `${host}/api/v1/user?accountNumber=${accountNumber}`,
      headers: {
        partnerCode: partnerCode,
        ts: ts
      }
    };

    let resp = await axios(options);

    console.log(resp.data);
    return resp.data;
  } catch (error) {
    console.log('3T error: ', error);
    throw error;
  }
}

const sendMoney = async (user_id, transaction) => {
  try {
    const mine = await MyBank.findOne({bank_name: 'S2Q Bank'});
    const ourPrivateKey = mine.private_key_rsa.replace(/\\n/g, "\n");
    const privateKey = NodeRSA(ourPrivateKey);
    const user = await User.findById(user_id);

    const data = {
      accountNumber: transaction.account_number,
      cost: transaction.amount,
      feeType: transaction.feePayBySender ? 'NOT_PAY' : 'PAY',
      sendAccountNumber: transaction.source,
      sendAccountName: user.full_name
    };

    const ts = Date.now();
    const hashedSign = md5(data + ts + md5(secretKey));
    const sign = privateKey.sign(data, 'base64', 'base64');
    const url = `${host}/api/v1/user/change-balance`;

    const headers = {
      partnerCode,
      ts,
      hashedSign,
      sign
    }

    const options = {
      method: 'POST',
      url: url,
      headers: headers,
      data: data
    }
    let resp = await axios(options);

    let ret_req = {
      partner_name: '3TBank',
      request_uri: url,
      request_header: headers,
      request_body: data,
      request_time: Date.now(),
      signature: sign,
      request_amount: transaction.amount
    }
    let ret_res = {
      partner_name: '3TBank',
      response_time: Date.now(),
      response_data: resp.data,
      response_header: resp.header,
      signature: resp.data.sign
    }
    return {
      request: ret_req,
      response: ret_res,
      data: resp.data
    }
  } catch (error) {
    console.log('3T tranfer error:', error);
    throw error;
  }
}

module.exports = {
  getAccountInformation,
  sendMoney,
}
