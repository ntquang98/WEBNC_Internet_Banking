const moment = require('moment');
const crypto = require('crypto');
const axios = require('axios');
const Bank = require('../models/schema/bank');
//TODO: Lam cai nay ngay
/**
 * request info
 * header = {
 *  timestamp
 *  security_key
 *  hash
 * }
 * GET /public/query/:account_number
 * 
 */

//const private_key = `-----BEGIN RSA PRIVATE KEY-----\nMIICWwIBAAKBgQCdVTZf1j7wafF7lbvOozMj6uydy7BCY75cSIlGnJbKvRPCEbci\nvxE8PH+pJJ5/k/DGFjY7XSRqzqyCzm0LnvV+57/u/7hXBlpcm+ft2felIIXc/hFS\nID0EACtBnlVtXnJ+38Xlh96sE0ABjGmDXUXKyQ7BEhqumd4iG2Yuhh3s+QIDAQAB\nAoGAB2OnKB0h25y+MLW5mlzj2/3+mvKkFpokqKTnfZ+BHYh/0w+N8F3U62VUAZes\nsgU6u7LzXRpkyXdndsVHLdKLaRWTTHILkmfFHMts10jMX6/2aKvi2x+4lRP1RMBI\nsaTLOqgVFBI8bW+A8dHwce+CorO10x3xq/y0JFjqaE1S+lkCQQDJctCt5ALzKyUH\n75k6v0Eqmr2c0HsSJeSxA8oPq7377WnlV1fRxIExCFNwF1y4S7HH3LI/pX1Mef2k\n/MXsl7IbAkEAx/Ahs3h4ZGY6sZvzrLjuqWSqasYpgzgoab1yxUTjU3n7ldEudFsR\ncGh5eR4YrOnx4rYQgTem3+10DWMnFVeuewJAfZPbTmszA49DuFy+MocDAqIPzW+R\nKNECbO6lyXsQJbnsJ5F5J0TOHFjKWrfVjvVwz9xeKZrqLwBlA7KnV0OBPQJAKCtf\nqf4nOgyr+CkcAPS6xn+6GW+swXdT70Knv2iCv6+/Uy9OxQPS8iGbXjEkxgDOnzzy\n/fMfbNf5PANSw9/05wJAecNvZPfNiCKene4HiWQgziONksof2aB5g2TRSwYpz83R\nUu2hb3bfD9/N7DT3qab+n+s4u7x+4kdz8GrZNuMCZw==\n-----END RSA PRIVATE KEY-----`;

// nkl
const private_key = `-----BEGIN ENCRYPTED PRIVATE KEY-----
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
-----END ENCRYPTED PRIVATE KEY-----`;

// mp
/* const private_key = `
-----BEGIN RSA PRIVATE KEY-----
MIICWgIBAAKBgFHQ+NlOAcSzcr41rFJ8lX0K9tTHsYziDhIt0mBC4/X5iuAkBma6
uuhZhkMfyzoFj7SPc4DDNyBR21nYJjxa2JNadiLi7y6dD05TQQcpwmcfaIJWTvPM
kNeWtx0sDnlDtgdmDIwpXKLy4v/cqC+f9dhdm0WECUjr78FvDdY+baBhAgMBAAEC
gYAic7nmX7fU6a++swFOdtHIJu7LqQ92ANbmBs+Y43H06VD2k5Tye10rbE9iQqgk
VaUu5l0/8nRrMq0Ih0GKlsKtx9VLffDS5/uXrHMzNeLpa57JQGnB/EQcaAbYgkIE
4AHkE0BC37OakMGNPwksJmIbuE4DuaFn3Ay7zPIv6AZX8QJBAJ0ZCd3ELqJLSyuW
ss88qI+pCQS8WHuVeU8zTyAOMo6hhHrocXs7s57tj1jZNW+yCxuUojm1BzAinRpR
YGcWKKUCQQCFUwxkkpAP2wL6cbgOI8FW6OKCxkNbiZsczdppTERZ1KSQBoCNuyut
O8N+7z0hhbWeLgspQfWPo+tLJ18yElANAkAw+PM4bMXU1f/y8KGBNPme/yTOkyBK
NkiAxg/ugD6GdBdmcTufHPdbndbH7b5YuXn4+RaxQpuhB8lNwPx6Zk/5AkBPnrMN
9MD31xFGQ1dpikzR/C4ZbxGWvuzVHNJMg/FlvCmyoU9wVNDWmZQ8X98f/9vgZRrh
PrTJXVkM/qxJGMqZAkAmcWH2lZLzIP43Mu78eX/SfZNzLftfNRtSIuvWRYh+5KCD
kREzQ9qJaVXPvKoFjEHSJZK96vEtmvk+jmBNGfsN
-----END RSA PRIVATE KEY-----`; */

//const baseURL = 'https://s2q-ibanking.herokuapp.com';
const baseURL = 'http://localhost:3000'
const getInfo = async (account_number) => {
  let timestamp = moment().unix();
  let security_key = "H8PIBP9MPMOM";
  let _data = JSON.stringify(account_number);
  try {
    let response = await axios({
      method: 'get',
      url: `public/${account_number}`,
      baseURL: baseURL,
      headers: {
        timestamp,
        security_key,
        hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex')
      }
    });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}

//getInfo('1596891106');
// POST /public/transfer
/**
 * 
 */
const sendMoney = async (account_number, amount) => {
  let timestamp = moment().unix();
  let security_key = "H8PIBP9MPMOM";
  let data = {
    source_account: '12345',
    destination_account: account_number,
    source_bank: 'NKLBank',
    description: 'B abc',
    feePayBySender: true,
    fee: 3300,
    amount
  };
  let _data = JSON.stringify(data);
  try {
    // create signature
    let privateKey = private_key.replace(/\\n/g, '\n');
    let signer = crypto.createSign('sha256');
    signer.update(_data);
    let signature = signer.sign({
      key: privateKey,
      passphrase: 'info@nklbank.com'
    }, 'hex');

    // send request
    let result = await axios({
      method: 'post',
      url: 'public/transfer',
      baseURL: baseURL,
      headers: {
        timestamp,
        security_key,
        hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex')
      },
      data: {
        data,
        signature,
      }
    });
    console.log(result.data);
  } catch (error) {
    //console.log(error);
    console.log(error.response.status);
    console.log(error.response.message);
  }
}

sendMoney('1596891106', 10000);
