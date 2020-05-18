/* eslint-disable no-undef */
const { checkPartner, isNewPackage, isOriginPackage, verifySignature } = require('../utils/security');
const mongoose = require('mongoose');
const databaseName = 'test';
beforeAll(async () => {
  const url = "mongodb://admin:admin123@banktranfer-shard-00-00-vl6zg.mongodb.net:27017,banktranfer-shard-00-01-vl6zg.mongodb.net:27017,banktranfer-shard-00-02-vl6zg.mongodb.net:27017/test?ssl=true&replicaSet=BankTranfer-shard-0&authSource=admin&retryWrites=true&w=majority";
  await mongoose.connect(url, { useNewUrlParser: true });
});

describe("checkPartner", () => {
  it("should find testrsa", async () => {
    let partner = await checkPartner("test1");
    expect(partner).toBeTruthy();
  });

  it("should not find any partner", async () => {
    let partner = await checkPartner("random123");
    expect(partner).toBeFalsy();
  });


});

afterAll(async done => {
  mongoose.disconnect();
  done();
});