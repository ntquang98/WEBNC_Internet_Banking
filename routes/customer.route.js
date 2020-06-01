const express = require("express");
const router = express.Router();
const createError = require('http-errors');
const AccountController = require('../controllers/account.controller');

router.get('/accounts', async (req, res) => {
  //let { user_id } = req.headers;
  // tạm thời giả định user_id nằm trong header, khi có auth sẽ được giải mã từ jwt
  let { user_id } = req.tokenPayload;
  try {
    let accounts = await AccountController.getAllAccount(user_id);
    res.status(200).send(accounts);
  } catch (error) {
    throw createError(404, { message: 'not found', error })
  }
});

router.get('/accounts/:account_number', async (req, res) => {
  let { account_number } = req.params;
  try {
    let account = await AccountController.getOneAccountByAccountNumber(account_number);
    res.status(200).send(account);
  } catch (error) {
    throw createError(404, { message: 'not found', error });
  }
});

router.post('/accounts', async (req, res) => {
  // TODO: nếu trong môi trường sản phẩm, nên làm thêm số tiền mong muốn cần tiết kiêm
  let account_name = req.body.account_name;
  let user_id = req.header.user_id;
  if (!account_name) {
    res.status(403).send({ message: "Missing name of saving account" });
    return;
  }
  try {
    let account = await AccountController.createAccount(account_name, user_id);
    res.status(200).send(account);
  } catch (error) {
    throw createError(404, error);
  }
});

router.delete('/accounts/:account_number', async (req, res) => {
  try {
    let rs = await AccountController.deleteAccount(req.params.account_number);
    res.status(200).send(rs);
  } catch (error) {
    throw createError(error.status, error);
  }
});

router.put('/accounts/:account_number', async (req, res) => {
  let { account_name } = req.body;
  try {
    let result = await AccountController.changeAccountName(req.params.account_number, account_name);
    res.status(200).send(result);
  } catch (error) {
    throw createError(404, error);
  }
});

router.post('/receivers', (req, res) => {

});

router.get('/receivers', (req, res) => {

});

router.get('/receivers/:receiver_id', (req, res) => {

});

router.put('/receivers/:receiver_id', (req, res) => {

});

router.delete('/receivers/:receiver_id', (req, res) => {

});

router.get('/debt_lists', (req, res) => {

});

router.post('/debt_lists', (req, res) => {

});

router.put('/debt-list/:debtor_id', (req, res) => {

});

module.exports = router;