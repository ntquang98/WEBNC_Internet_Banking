const axios = require('axios');
const qs = require('qs');
const Bank = require('../../models/schema/bank');
const MyBank = require('../../models/schema/my_bank');
const {encryptData, signPgp} = require('../../utils/security');
const fs = require('fs');
const openpgp = require('openpgp')

// B1: Lấy token dựa vào tài khoản cấp cho nhóm bạn
const getPartnerToken = async () => {
  try {
    const data = qs.stringify({
      id: '3',
      code: 'QUANGNGUYEN',
      name: 'QUANGNGUYEN',
      password: 'quangnguyen',
    });
    const options = {
      method: 'POST',
      url: 'https://qbanking.herokuapp.com/api/v1/partner/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };
    const resp = await axios(options);
    const {token} = resp.data;
    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// const message = {
//   account_number: '3919276761',
// };
const getProfile = async (account_number) => {
  try {
    const token = await getPartnerToken();
    const partner = await Bank.findOne({bank_name: 'qbanking'});

    const partnerPublicKey = partner.public_key_pgp.replace(/\\n/g, "\n");
    const dataSend = JSON.stringify({account_number: account_number});

    const message = await encryptData(dataSend, partnerPublicKey);

    const data = qs.stringify({
      message: message
    });
    // Encrypt message trên theo publicKey
    const options = {
      method: 'GET',
      url: 'https://qbanking.herokuapp.com/api/v1/partner/getProfile',
      headers: {
        partner: `${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };
    const resp = await axios(options);
    const profile = resp.data;
    //console.log(profile)
    return {
      full_name: profile.account_profile.fullname,
      email: profile.account_profile.email,
      account_number: profile.account_profile.account_number,
    }
    //return profile;
  } catch (error) {
    console.log(error);
    console.error('Error: ', error.message);
    throw error;
  }
};
const signPartner = async (priKey, pass) => {
  const {
    keys: [privateKey],
  } = await openpgp.key.readArmored(priKey);
  await privateKey.decrypt(pass);
  const {data: cleartext} = await openpgp.sign({
    message: openpgp.cleartext.fromText('Ngân hàng QuangNguyen'),
    privateKeys: [privateKey],
  });
  return cleartext;
};
// {
//   "account_number": "3919276761",
//   "amount": 100000,
//   "message": "Chuyển tiền liên ngân hàng QuangNguyen"
// }
const payIn = async (user_id, transaction) => {
  try {
    const token = await getPartnerToken();
    const partner = await Bank.findOne({bank_name: 'qbanking'});
    const mine = await MyBank.findOne({bank_name: 'S2Q Bank'});

    const partnerPublicKey = partner.public_key_pgp.replace(/\\n/g, "\n");
    const ourPrivateKey = mine.private_key_pgp.replace(/\\n/g, "\n");

    const dataSend = {
      account_number: transaction.account_number,
      amount: transaction.amount,
      message: transaction.transactionMessage
    };


    let message = await encryptData(JSON.stringify(dataSend), partnerPublicKey);

    let signd = await signPartner(ourPrivateKey, mine.pgp_passphrase);
    fs.writeFileSync('./testsign.txt', signd)

    const data = qs.stringify({
      message: message,
      sign_partner: signd,
    });

    const options = {
      method: 'post',
      url: 'https://qbanking.herokuapp.com/api/v1/partner/payin',
      headers: {
        partner: `${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };
    const resp = await axios(options);
    console.log(resp.data);
    return {
      request: options,
      response: resp,
      data: resp.data
    };
  } catch (error) {
    console.error('Error: ', error.message);
    throw error;
  }
};

module.exports = {
  getPartnerToken,
  getProfile,
  payIn,
};
