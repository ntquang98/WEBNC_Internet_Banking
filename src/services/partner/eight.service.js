const crypto = require('crypto');
const openpgp = require('openpgp');
const partner_code = "S2Q Bank";
const secret_key = 'day la secret key';
const passphrase = '123456';
const axios = require('axios');
const createError = require('http-errors');
const Bank = require('../../models/schema/bank');
const MyBank = require('../../models/schema/my_bank');
const User = require('../../models/schema/user');

const requestInfo = async accountId => {
  try {
    const Eight = await Bank.findOne({bank_name: 'Eight'});
    const mine = await MyBank.findOne({bank_name: 'S2Q Bank'});

    let partnerPublicKey = Eight.public_key_pgp.replace(/\\n/g, "\n");
    let ourPrivateKey = mine.private_key_pgp.replace(/\\n/g, "\n");

    const accountIdHashed = crypto.createHmac('SHA1', secret_key).update(accountId).digest('hex');
    let {data: accountIdEncrypted} = await openpgp.encrypt({
      message: openpgp.message.fromText(accountId),
      publicKeys: (await openpgp.key.readArmored(partnerPublicKey)).keys
    });

    accountIdEncrypted = accountIdEncrypted.replace(/\r/g, "\\n").replace(/\n/g, "");
    const currentTime = Math.round((new Date()).getTime())
    const entryTimeHashed = crypto.createHmac('SHA1', secret_key).update(currentTime.toString()).digest('hex')

    let {data: entryTimeEncrypted} = await openpgp.encrypt({
      message: openpgp.message.fromText(currentTime.toString()),
      publicKeys: (await openpgp.key.readArmored(partnerPublicKey)).keys
    });

    entryTimeEncrypted = entryTimeEncrypted.replace(/\r/g, "\\n").replace(/\n/g, "")

    const {keys: [privateKey]} = await openpgp.key.readArmored(ourPrivateKey)
    await privateKey.decrypt(mine.pgp_passphrase)

    let {data: digitalSignature} = await openpgp.sign({
      message: openpgp.cleartext.fromText(accountId), // CleartextMessage or Message object
      privateKeys: [privateKey]                             // for signing
    });

    digitalSignature = digitalSignature.replace(/\r/g, "\\n").replace(/\n/g, "")
    let instance = axios.create({
      baseURL: 'http://34.87.97.142/transactions/receiver-interbank',
      timeout: 5000,
      headers: {
        'x_partner_code': partner_code,
        'x_signature': digitalSignature,
        'x_account_id_hashed': accountIdHashed,
        'x_account_id_encrypted': accountIdEncrypted,
        'x_entry_time_encrypted': entryTimeEncrypted,
        'x_entry_time_hashed': entryTimeHashed
      }
    })

    instance.interceptors.request.use(
      config => {
        config.headers.x_access_token = partner_code
        config.headers.x_signature = digitalSignature
        config.headers.x_account_id_hashed = accountIdHashed
        config.headers.x_account_id_encrypted = accountIdEncrypted
        config.headers.x_entry_time_encrypted = entryTimeEncrypted
        config.headers.x_entry_time_hashed = entryTimeHashed
        return config
      },
      error => {
        console.log("error ne", error)
        return Promise.reject(error)
      }
    )

    instance.interceptors.response.use((response) => {
      return response;
    }, (error) => {
      return Promise.resolve({error});
    });
    const response = await instance({
      method: 'get',
      url: ''
    })

    if (response && !response.error) {
      return {
        full_name: response.data.data[0].full_name,
        email: '',
        account_number: accountId
      }
      //return response.data;
    } else {
      if (response && response.error && response.error.response && response.error.response.status) {
        throw createError(response.error.response.status, response.error.response.data);
        //res.status(response.error.response.status).json(response.error.response.data)
      }
    }
  } catch (error) {
    throw error;
  }
}

const sendMoney = async (user_id, transaction) => {
  try {
    const Eight = await Bank.findOne({bank_name: 'Eight'});
    const mine = await MyBank.findOne({bank_name: 'S2Q Bank'});

    let partnerPublicKey = Eight.public_key_pgp.replace(/\\n/g, "\n");
    let ourPrivateKey = mine.private_key_pgp.replace(/\\n/g, "\n");
    let user = await User.findById(user_id);
    let dataSend = {
      toAccountId: transaction.des_acc,
      toFullName: transaction.toFullName,
      fromAccountId: transaction.src_acc,
      fromFullName: user.full_name,
      fromBankId: 'S2Q Bank',
      transactionAmount: transaction.amount,
      isFeePayBySender: transaction.isFeePayBySender,
      fee: transaction.fee,
      transactioionMessage: transaction.transactioionMessage
    }

    let entryTime = Math.round((new Date()).getTime());
    dataSend.entryTime = entryTime;
    const data_hashed = crypto.createHmac('SHA1', secret_key).update(JSON.stringify(dataSend)).digest('hex');

    const {keys: [privateKey]} = await openpgp.key.readArmored(ourPrivateKey);
    await privateKey.decrypt(mine.pgp_passphrase);

    let {data: digital_sign} = await openpgp.sign({
      message: openpgp.cleartext.fromText(JSON.stringify(dataSend)),
      privateKeys: [privateKey]
    });

    digital_sign = digital_sign.substring(digital_sign.indexOf('-----BEGIN PGP SIGNATURE-----'), digital_sign.length);
    digital_sign = digital_sign.replace(/\r/g, "\\n").replace(/\n/g, "");

    const {data: bodyData} = await openpgp.encrypt({
      message: openpgp.message.fromText(JSON.stringify(dataSend)),
      publicKeys: (await openpgp.key.readArmored(partnerPublicKey)).keys
    });

    let data = {
      data: bodyData,
      digital_sign,
      data_hashed
    }

    let instance = axios.create({
      baseURL: 'http://34.87.97.142/transactions/receiving-interbank',
      timeout: 5000
    });

    let request = instance.interceptors.request.use(
      config => {
        config.headers.x_partner_code = partner_code
        return config
      },
      error => {
        console.log("error ne", error)
        return Promise.reject(error)
      }
    )

    instance.interceptors.response.use((response) => {
      return response;
    }, (error) => {
      return Promise.resolve({error});
    });

    const response = await instance({
      method: 'post',
      url: '',
      data
    })
    console.log(response)
    if (response && !response.error) {

      let ret_req = {
        partner_name: 'Eight',
        request_uri: 'http://34.87.97.142/transactions/receiving-interbank',
        request_header: null,
        request_body: data,
        request_time: Date.now(),
        signature: digital_sign,
        request_amount: transaction.amount
      }
      let ret_res = {
        partner_name: 'Eight',
        response_time: Date.now(),
        response_data: response.data.data,
        response_header: response.config.headers,
        signature: response.data.data.digital_sign
      }

      return {
        request: ret_req,
        response: ret_res,
        data: response.data
      };
    } else {
      if (response &&
        response.error &&
        response.error.response &&
        response.error.response.status) {
        throw createError(response.error.response.status, response.error.response.data)
      }
      throw createError(500, 'Server Error');
    }
  } catch (error) {
    throw error;
  }
}


module.exports = {
  requestInfo,
  sendMoney
}
