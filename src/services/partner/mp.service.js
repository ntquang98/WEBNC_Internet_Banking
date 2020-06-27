const Bank = require('../../models/schema/bank');
const MyBank = require('../../models/schema/my_bank');
const bcrypt = require('bcryptjs');
const openpgp = require('openpgp');

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

    let response = axios({
      method: 'GET',
      url: 'https://mpbinternetbanking.herokuapp.com/user/accountNumber',
      data: {
        account: account
      },
      headers: headers
    });

    return response.data;

  } catch (error) {
    throw error;
  }
}

const sendMoney = async (user_id, transaction) => {

  try {
    const mine = await MyBank.findOne({bank_name: 'S2QBank'});
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

    let response = axios({
      method: 'POST',
      url: 'https://mpbinternetbanking.herokuapp.com/user/transferLinkBank',
      data: data,
      headers: headers
    });

    return {
      request: {
        headers,
        data
      },
      response
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  requestInfo,
  sendMoney
}
