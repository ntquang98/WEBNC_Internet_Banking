const { encrypt } = require('../utils/security');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const { find } = require('../models/linked_bank.model');
const { beforeAll, afterAll, describe, it, expect } = require('jest');
const request = require('supertest');
const app = require('../routes/linked_bank.route');

beforeAll(async () => {
  const url = "mongodb://admin:admin123@banktranfer-shard-00-00-vl6zg.mongodb.net:27017,banktranfer-shard-00-01-vl6zg.mongodb.net:27017,banktranfer-shard-00-02-vl6zg.mongodb.net:27017/test?ssl=true&replicaSet=BankTranfer-shard-0&authSource=admin&retryWrites=true&w=majority";
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

const createRequestPackage = async () => {
  let data = {
    "account_number": "00063553",
    "amount": 10000
  }
  let _data = JSON.stringify(data, null, 2);
  let timestamp = moment().unix();
  let secret_key = "test1";
  let bank = await find({ security_key: secret_key });
  let { private_key, signature_encode_type, signature_format, encode_type } = bank.attribute_data[0];
  let hash = crypto.createHash(encode_type).update(timestamp + _data + secret_key).digest('hex');
  private_key = private_key.replace(/\\n/g, '\n'); // FIXME: private key hay public key lay tu db len
  let req = {
    header: {
      timestamp,
      secret_key
    },
    body: {
      data,
      hash,
      signature: await encrypt(data, signature_encode_type, private_key, signature_format)
    }
  }
  return req;
}

describe('Get Should Success', () => {
  it('should get account owner information', async () => {
    let data = { account_number: "00063553" };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    let res = await request(app)
      .get('/account')
      .set({
        timestamp,
        security_key
      })
      .send({
        data,
        hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex')
      });
    console.warn(res);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeTruthy();
  });

  it('should update account 00063553, 10000', async () => {
    let data = { account_number: "00063553", amount: 10000 };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    let bank = await find({ security_key });
    let { private_key } = bank.attribute_data[0];
    private_key = private_key.replace(/\\n/g, '\n');
    let res = await request(app)
      .post('/account')
      .set({
        timestamp,
        security_key
      })
      .send({
        data,
        hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex'),
        signature: await encrypt(data, 'sha256', private_key, 'hex')
      });
    console.warn(res);
    expect(res.statusCode).toEqual(200);
  });
});

afterAll(async done => {
  mongoose.disconnect();
  done();
});