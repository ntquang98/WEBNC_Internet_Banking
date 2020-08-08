const openpgp = require('openpgp')
const MyBank = require('../models/schema/my_bank')
const axios = require('axios');
const qs = require('qs');
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
(async () => {
  const mine = await MyBank.findOne({bank_name: 'S2Q Bank'});
  const token = await getPartnerToken();
  let pri = mine.private_key_pgp.replace(/\\n/g, "\n");

  const sign = await signPartner(pri, mine.pgp_passphrase);
  const data = qs.stringify({
    message:
      '-----BEGIN PGP MESSAGE-----\nVersion: OpenPGP v2.0.8\nComment: https://sela.io/pgp/\n\nwcBMAzR86i/pqyZAAQf9HD+FTtx//n4A7Auk99jsuLhxgTeBufqX2ArqvRtLahSX\n2WqNlxhfB5PMDeYfhEYDCz2doJCdsUvfVE/N/N82fMjMct6bC47Ya4z1SVxZIUD7\nVzzGrvueDApd7IpPwkkotlAVR2453DNcQkz4XQ598zGdjmyL5l6SdF8wbIXQ+lcE\nEgLq0pL0tObqVrjuya3P5QRyswVVpgZx4vKEf9uGmw7fnw1SQ3wMwX37M8cNiWIZ\n/df8qUS+LSgSqikd398V3NPHc0WhK0nrBivFuCoITR1y8YzEAkOWaDObtKBz879b\nCl5/luykwpWLMYf6xMFo859GRBXcXN6nC5M7AMti7dKlARVvb9J1htVciw4DsHHE\n1tNDWgUsltKMTPzywhpyAOxb1AsimHcjOvriw1dyvMzX5fgk2hQFZ/oQbokvqa64\n3GOG9MG99tNY9FsLVAsOxdIXspUtSVaBC4sbXoWHdT1xfGxviF/jjI+/64BspmPE\n+yyF/vStp2b91L1dTjpJZStMOvlc4gxsgdKxPP6GzTnPX5Hw//xyIClqvYIhu1z9\nJWIq7Har\n=+dbj\n-----END PGP MESSAGE-----',
    sign_partner: sign,
  });
  const config = {
    method: 'post',
    url: 'https://qbanking.herokuapp.com/api/v1/partner/payin',
    headers: {
      partner: token,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: data,
  };
  console.log('CONFIG: ', config);

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
})();
