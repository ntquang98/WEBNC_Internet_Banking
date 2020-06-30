const MyBank = require('../../models/schema/my_bank');
const bcrypt = require('bcryptjs');
const openpgp = require('openpgp');
const createError = require('http-errors');
const axios = require('axios');

const requestInfo = async account => {
  try {
    let timestamp = Date.now();
    let secret = 'H8PIBP9MPMOMHHMNFH785';
    let sig = account + secret + timestamp;
    let signature = bcrypt.hashSync(sig, 10);

    const headers = {
      'partnercode': 's2qbank',
      'headersig': signature,
      'headerts': timestamp
    }

    let response = await axios({
      method: 'GET',
      url: 'https://mpbinternetbanking.herokuapp.com/user/accountNumber',
      data: {
        account: account
      },
      headers: headers
    });

    console.log("response", response)
    return response.data;

  } catch (error) {
    console.log(error.response)
    if (error.response) {
      throw createError(error.response.status, error.response.statusText);
    }
    throw createError(500, error);
  }
}

const sendMoney = async (user_id, transaction) => {

  try {
    const mine = await MyBank.findOne({bank_name: 'S2Q Bank'});
    let ourPrivateKey = mine.private_key_pgp.replace(/\\n/g, '\n');

    const {keys: [privateKey]} = await openpgp.key.readArmored(ourPrivateKey);
    await privateKey.decrypt(mine.pgp_passphrase);

    const {signature: detachedSignature} = await openpgp.sign({
      message: openpgp.cleartext.fromText('Nap tien'),
      privateKeys: [privateKey],
      detached: true
    });

    let timestamp = Date.now();
    let secret = 'H8PIBP9MPMOMHHMNFH785';
    let sig = transaction.des_acc + secret + timestamp;
    let signature1 = bcrypt.hashSync(sig, 10);

    const headers = {
      'partnercode': 's2qbank',
      'headersig': signature1,
      'headerts': timestamp
    };

    const data = {
      accountReceiver: transaction.des_acc,
      money: transaction.amount,
      signature: detachedSignature,
      content: transaction.description,
      typeSend: transaction.feePayBySender,
      fee: transaction.fee,
      nameBank: 'S2QBank',
      accountSender: transaction.src_acc
    }

    let request = {
      partner_name: 'MPBank',
      request_uri: 'https://mpbinternetbanking.herokuapp.com/user/transferLinkBank',
      request_header: headers,
      request_body: data,
      request_time: new Date(),
      signature: mine.private_key_pgp,
      request_amount: transaction.amount
    }

    let response = await axios({
      method: 'POST',
      url: 'https://mpbinternetbanking.herokuapp.com/user/transferLinkBank',
      data: data,
      headers: headers
    });

    let ret_res = {
      partner_name: "MPBank",
      response_time: new Date(),
      response_header: response.headers,
      response_body: response.data,
      signature: response.data.result.signatureMBP
    }

    return {
      request,
      response: ret_res
    };
  } catch (error) {
    if (error.response) {
      throw createError(error.response.status, error.response.statusText);
    }
    throw error;
  }
}

module.exports = {
  requestInfo,
  sendMoney
}
