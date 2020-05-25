/* eslint-disable no-undef */
const { encrypt } = require('../utils/security');
const moment = require('moment');
const crypto = require('crypto');
const { find } = require('../models/linked_bank.model');
const request = require('supertest');

const { app, disconnect } = require('../app_test');

describe('Get Should Success', () => {
  it('should get owner of "00051027" information', async done => {
    let data = { account_number: "00051027" };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    try {
      let res = await request(app)
        .get('/api/v1/linked/account')
        .set({
          timestamp,
          security_key
        })
        .send({
          data,
          hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex')
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeTruthy();
      done();
    } catch (error) {
      done(error);
      throw error;
    }
  });


  it('should update account 00051027 + 10000', async done => {
    let data = { account_number: "00051027", amount: 10000 };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    let bank = await find({ security_key });
    let { private_key } = bank.attribute_data[0];
    private_key = private_key.replace(/\\n/g, '\n');
    try {
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
      done();
    } catch (err) {
      done(err);
      throw err;
    }
  });
});

describe('Get Should fail', () => {
  it('should not get owner of "00" information', async done => {
    let data = { account_number: "00" };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    try {
      let res = await request(app)
        .get('/api/v1/linked/account')
        .set({
          timestamp,
          security_key
        })
        .send({
          data,
          hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex')
        });
      expect(res.statusCode).toEqual(404);
      done();
    } catch (error) {
      done(error);
      throw error;
    }
  });


  it('should not update account 00 + 10000', async done => {
    let data = { account_number: "00", amount: 10000 };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    let bank = await find({ security_key });
    let { private_key } = bank.attribute_data[0];
    private_key = private_key.replace(/\\n/g, '\n');
    try {
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
      expect(res.statusCode).toEqual(404);
      done();
    } catch (err) {
      done(err);
      throw err;
    }
  });
});

afterAll(async () => {
  await disconnect();
});