const moment = require('moment');
const crypto = require('crypto');
const axios = require('axios');
const Bank = require('../models/schema/bank');
const { send } = require('process');
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

const private_key = `-----BEGIN RSA PRIVATE KEY-----\nMIICWwIBAAKBgQCdVTZf1j7wafF7lbvOozMj6uydy7BCY75cSIlGnJbKvRPCEbci\nvxE8PH+pJJ5/k/DGFjY7XSRqzqyCzm0LnvV+57/u/7hXBlpcm+ft2felIIXc/hFS\nID0EACtBnlVtXnJ+38Xlh96sE0ABjGmDXUXKyQ7BEhqumd4iG2Yuhh3s+QIDAQAB\nAoGAB2OnKB0h25y+MLW5mlzj2/3+mvKkFpokqKTnfZ+BHYh/0w+N8F3U62VUAZes\nsgU6u7LzXRpkyXdndsVHLdKLaRWTTHILkmfFHMts10jMX6/2aKvi2x+4lRP1RMBI\nsaTLOqgVFBI8bW+A8dHwce+CorO10x3xq/y0JFjqaE1S+lkCQQDJctCt5ALzKyUH\n75k6v0Eqmr2c0HsSJeSxA8oPq7377WnlV1fRxIExCFNwF1y4S7HH3LI/pX1Mef2k\n/MXsl7IbAkEAx/Ahs3h4ZGY6sZvzrLjuqWSqasYpgzgoab1yxUTjU3n7ldEudFsR\ncGh5eR4YrOnx4rYQgTem3+10DWMnFVeuewJAfZPbTmszA49DuFy+MocDAqIPzW+R\nKNECbO6lyXsQJbnsJ5F5J0TOHFjKWrfVjvVwz9xeKZrqLwBlA7KnV0OBPQJAKCtf\nqf4nOgyr+CkcAPS6xn+6GW+swXdT70Knv2iCv6+/Uy9OxQPS8iGbXjEkxgDOnzzy\n/fMfbNf5PANSw9/05wJAecNvZPfNiCKene4HiWQgziONksof2aB5g2TRSwYpz83R\nUu2hb3bfD9/N7DT3qab+n+s4u7x+4kdz8GrZNuMCZw==\n-----END RSA PRIVATE KEY-----`;

const getInfo = async (account_number) => {
  let timestamp = moment().unix();
  let security_key = "test1";
  let _data = JSON.stringify(account_number);
  try {
    let response = await axios({
      method: 'get',
      url: `public/${account_number}`,
      baseURL: 'http://localhost:3000',
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

//getInfo('1601399422');
// POST /public/transfer
/**
 * 
 */
const sendMoney = async (account_number, amount) => {
  let timestamp = moment().unix();
  let security_key = "test1";
  let data = {
    source_account: '12345',
    destination_account: account_number,
    source_bank: 'test1',
    description: 'B abc',
    feePayBySender: true,
    fee: 3300,
    amount
  };
  let _data = JSON.stringify(data);
  try {
    let privatek = private_key.replace(/\\n/g, '\n');
    let signer = crypto.createSign('sha256');
    signer.update(_data);
    let signature = signer.sign(privatek, 'hex');
    let result = await axios({
      method: 'post',
      url: 'public/transfer',
      baseURL: 'http://localhost:3000',
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
    console.log(error.response.status);
    console.log(error.response.message);
  }
}

sendMoney('1601399422', 10000);
