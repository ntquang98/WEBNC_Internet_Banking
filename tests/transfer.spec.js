/* eslint-disable no-undef */
const { encrypt } = require('../utils/security');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const { find } = require('../models/linked_bank.model');
const request = require('supertest');

const app = require('../app_test');

beforeAll(async () => {
  const url = "mongodb://admin:admin123@banktranfer-shard-00-00-vl6zg.mongodb.net:27017,banktranfer-shard-00-01-vl6zg.mongodb.net:27017,banktranfer-shard-00-02-vl6zg.mongodb.net:27017/test?ssl=true&replicaSet=BankTranfer-shard-0&authSource=admin&retryWrites=true&w=majority";
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

describe('Get Should Success', () => {
  it('should get account owner information', async (done) => {
    let data = { account_number: "00063553" };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    let res;
    try {
      res = await request(app)
        .get('/api/v1/linked/account')
        .set({
          timestamp,
          security_key
        })
        .send({
          data,
          hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex')
        })
    } catch (error) {
      return done(error);
    }
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeTruthy();
    done();
  });

  /* it('should update account 00063553, 10000', async () => {
    let data = { account_number: "00063553", amount: 10000 };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    let bank = await find({ security_key });
    let { private_key } = bank.attribute_data[0];
    private_key = private_key.replace(/\\n/g, '\n');
    let res = await request(app)
      .post('/api/v1/linked/account')
      .set({
        timestamp,
        security_key
      })
      .send({
        data,
        hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex'),
        signature: await encrypt(data, 'sha256', private_key, 'hex')
      });
    expect(res.statusCode).toEqual(200);
  }); */
});

afterAll(async done => {
  await mongoose.disconnect();
  done();
});