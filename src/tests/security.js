/* eslint-disable no-undef */
const { checkPartner, isNewPackage, isOriginPackage, verifySignature, encrypt } = require('../utils/security');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const { find } = require('../models/linked_bank.model');

beforeAll(async () => {
  const url = "mongodb://admin:admin123@banktranfer-shard-00-00-vl6zg.mongodb.net:27017,banktranfer-shard-00-01-vl6zg.mongodb.net:27017,banktranfer-shard-00-02-vl6zg.mongodb.net:27017/test?ssl=true&replicaSet=BankTranfer-shard-0&authSource=admin&retryWrites=true&w=majority";
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

const createTestReq = async () => {
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
  private_key = private_key.replace(/\\n/g, '\n');
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

const createErrorReq = async () => {
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
  private_key = private_key.replace(/\\n/g, '\n');
  data.amount = 50000; // change data
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

describe("verifyRSA", () => {
  it("should success", async () => {
    let req = await createTestReq();
    let partner = await checkPartner(req.header.secret_key);
    expect(partner).toBeTruthy();

    let { public_key_rsa, encode_type, signature_encode_type, encrypt_type } = partner.attribute_data[0];
    let isNew = isNewPackage(req.header.timestamp);
    expect(isNew).toBe(true);
    let isOrigin = isOriginPackage(req.body.data, req.header.timestamp, req.body.hash, req.header.secret_key, encode_type);
    expect(isOrigin).toBe(true);

    let public_key = public_key_rsa.replace(/\\n/g, '\n');
    let valid = await verifySignature(req.body.data, req.body.signature, public_key, signature_encode_type, encrypt_type);
    expect(valid).toBe(true);
  });

  it("should fail when req have been changed, not origin package", async () => {
    let req = await createErrorReq();
    let partner = await checkPartner(req.header.secret_key);
    expect(partner).toBeTruthy();
    let { encode_type } = partner.attribute_data[0];
    let isNew = isNewPackage(req.header.timestamp);
    expect(isNew).toBe(true);
    let isOrigin = isOriginPackage(req.body.data, req.header.timestamp, req.body.hash, req.header.secret_key, encode_type);
    expect(isOrigin).toBe(false);
  });
});

afterAll(async done => {
  mongoose.disconnect();
  done();
});