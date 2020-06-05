const express = require("express");
const router = express.Router();
const createError = require('http-errors');
const AccountController = require('../controllers/account.controller');
const ReceiverController = require('../controllers/receiver.controller');
const DebtReminderController = require('../controllers/debt_reminder.controller');

router.get('/accounts', async (req, res) => {
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
  let account_name = req.body.account_name;
  let { user_id } = req.tokenPayload;
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

router.post('/receivers', async (req, res) => {
  let { name, account_number, bank } = req.body;
  const { user_id } = req.tokenPayload;
  let receiver;
  try {
    if (bank === 'S2Q Bank') {
      receiver = await ReceiverController.createInnerReceiver(user_id, account_number, name);
    }
    // TODO: CASE outer bank
    res.status(201).send(receiver);
  } catch (error) {
    throw createError(403, error);
  }
});

router.get('/receivers', async (req, res) => {
  let { user_id } = req.tokenPayload;
  try {
    let receivers = await ReceiverController.getAllReceiverOfUser(user_id);
    res.status(200).send(receivers);
  } catch (error) {
    throw createError(404, { message: 'Not found', error });
  }
});

router.get('/receivers/:receiver_id', async (req, res) => {
  let { user_id } = req.tokenPayload;
  let { receiver_id } = req.params;
  try {
    let receiver = await ReceiverController.getReceiverOfUserById(user_id, receiver_id);
    res.status(200).send(receiver);
  } catch (error) {
    throw createError(404, error);
  }
});

router.put('/receivers/:receiver_id', async (req, res) => {
  let { name } = req.body;
  let { receiver_id } = req.params;
  let { user_id } = req.tokenPayload;
  try {
    let update = await ReceiverController.updateReceiver(user_id, receiver_id, name);
    res.status(201).send(update);
  } catch (error) {
    throw createError(404, error);
  }
});

router.delete('/receivers/:receiver_id', async (req, res) => {
  let { user_id } = req.tokenPayload;
  try {
    let update = await ReceiverController.deleteReceiver(user_id, req.params.receiver_id);
    res.status(200).send(update);
  } catch (error) {
    throw createError(404, error);
  }
});

router.get('/debt_lists', async (req, res) => {
  let { user_id } = req.tokenPayload;
  try {
    let debts = await DebtReminderController.getAllDebtReminder(user_id);
    res.status(200).send(debts);
  } catch (error) {
    throw createError(404, error);
  }
});

router.post('/debt_lists', async (req, res) => {
  let reminder = req.body;
  try {
    let rs = await DebtReminderController.createDebtReminder(reminder);
    res.status(201).send(rs);
  } catch (error) {
    throw createError(400, error);
  }
});

router.put('/debt_lists/:debtor_id', async (req, res) => {
  let { reminder_id } = req.body;
  try {
    let rs = await DebtReminderController.deleteReminder(reminder_id);
    res.status(200).send(rs);
  } catch (error) {
    throw createError(404, error);
  }
});

module.exports = router;