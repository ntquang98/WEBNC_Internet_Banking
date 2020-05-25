const express = require('express');
const router = express.Router();
const model = require('../models/linked_bank.model');
const api_query = require('../models/api_query');
const createError = require('http-errors');
const { slimCheck, fullCheck } = require('../middlewares/security.middleware');
const db = require('../utils/db');
const Account = require('../utils/account');
const security = require('../utils/security');
const moment = require('moment');

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

router.get('/account', slimCheck, async (req, res) => {
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
      username: result.attribute_data[0].user_name
    }

    return res.status(200).send(ret);
  } catch (err) {
    throw createError(404, "Not found account number");
  }
});

// send money
router.post('/account', fullCheck, async (req, res) => {
  try {
    /* let clientAccounts = await db.find({ model: Account, data: { account_number: req.body.data.account_number } });
    let clientAccount = clientAccounts.attribute_data[0];
    let { account_value, account_number } = clientAccount || {};

    console.log('after update', clientAccount);

    let amount = account_value + req.body.data.amount;

    console.log('amount after update', amount);

    let updateResult = await api_query.transfer({
      data: {
        input: [{
          account_number: account_number,
          account_value: amount
        }],
        output: [{
          model: "account",
          account_number: account_number
        }]
      }
    }); */

    let result = await db.increaseField({
      model: Account,
      query: { account_number: req.body.data.account_number },
      data: { account_value: req.body.data.amount }
    });

    // luu du lieu giao dich lai

    let updateResult = {
      success: true,
      timestamp: moment().unix(),
      data: req.body.data
    }

    let myBank = await model.findMyBank();
    myBank = myBank.attribute_data[0];
    let private_key = myBank.private_key.replace(/\\n/g, '\n');
    let sig = await security.encrypt(updateResult, 'sha256', private_key, 'hex');
    let ret = { data: updateResult, sig };
    return res.status(200).send(ret);
  } catch (err) {
    throw createError(404, "Not found account number");
  }
});

module.exports = router;