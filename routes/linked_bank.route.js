const express = require('express');
const router = express.Router();
const model = require('../models/linked_bank.model');
const api_query = require('../models/api_query');
const createError = require('http-errors');
const { slimCheck, fullCheck } = require('../middlewares/security.middleware');

router.post('/', async (req, res) => {
  let data = req.body;
  if (data.bank_name) {
    try {
      let result = await model.insert([data]);
      let myBank = await model.findMyBank();
      myBank = myBank.attribute_data[0];
      let ret = {
        bank_name: myBank.bank_name,
        public_key: myBank.public_key,
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
          model: "taikhoan",
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
});

module.exports = router;