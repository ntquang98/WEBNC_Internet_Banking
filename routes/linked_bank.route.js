const express = require('express');
const router = express.Router();
const model = require('../models/linked_bank.model');
const api_query = require('../models/api_query');
const createError = require('http-errors');
const { slimCheck, fullCheck } = require('../middlewares/security.middleware');
const db = require('../utils/db');
const Account = require('../utils/account');
const security = require('../utils/security');

router.post('/', async (req, res) => {
  let data = req.body;
  if (data.bank_name) {
    try {
      let result = await model.insert([data]);
      let myBank = await model.findMyBank();
      myBank = myBank.attribute_data[0];
      let ret = {
        bank_name: myBank.bank_name,
        public_key_rsa: myBank.public_key,
        public_key_pgp: myBank.public_key_pgp,
        key_length: myBank.key_length,
        crypt_type: myBank.crypt_type,
        secret_key: myBank.secret_key
      }
      if (result) {
        return res.status(200).json(ret);
      }
    } catch (error) {
      throw createError(400, "Bad request");
    }
  } else {
    throw createError(400, "Bad request");
  }
});

// find info
/**
 * req
 *  header:{
 *    timestamp: 
 *    security_key:
 * },
 * body: {
 *    data: {
 *      "account_number":"",
 *      "amount": 1000000  
 *    },
 *    hash: "",
 *    signature:
 * }
 */

router.get('/account', slimCheck, async (req, res) => {
  /**
   * TODO:
   * get /account
   * Lấy dữ liệu user gửi cho đối tác
   * Dữ liệu bao gồm username, Họ và tên -> xong
   */
  try {
    let result = await api_query.query({
      data: {
        input: [{
          model: "account",
          data: { account_number: req.body.data.account_number }
        }],
        output: [{ model: "user" }]
      }
    });
    let ret = {
      username: result.attribute_data[0].username
    }

    return res.status(200).send(ret);
  } catch (err) {
    throw createError(404, "Not found account number");
  }
});

// send money
router.post('/account', fullCheck, async (req, res) => {
  /**
   * TODO:
   * post /account
   * 1. Lấy tài khoản
   * 2. Tăng tiền cho tài khoản
   * 3. Kí gói tin trả cho đối tác dùng hàm encrypt
  */
  try {
    let clientAccounts = await db.find({ model: Account, data: { account_number: req.body.data.account_number } });
    let clientAccount = clientAccounts.attribute_data[0];
    let { account_value, account_number } = clientAccount || {};
    account_value = account_value + Number(req.body.data.amount);

    let updateResult = await api_query.transfer({
      data: {
        input: [{
          account_number: account_number,
          account_value: account_value
        }],
        output: [{
          model: "account",
          account_number: account_number
        }]
      }
    });

    let myBank = await model.findMyBank();
    myBank = myBank.attribute_data[0];
    let private_key = myBank.private_key.replace(/\\n/g, '\n');
    let sig = await security.encrypt(updateResult, 'sha256', private_key, 'hex');
    let ret = { data: updateResult, sig };
    return res.status(200).send(ret);
    /* db.updateOne({ model: Account, data: { id: _id, account_value: account_value } })
      .then(async (result) => {
      }).catch((err) => {
        throw createError(404, "Can not update account amount!");
      }); */
  } catch (err) {
    throw createError(404, "Not found account number");
  }
});

module.exports = router;