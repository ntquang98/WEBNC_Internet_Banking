const customerService = require('../services/customer.service');
const partnerService = require('../services/partner.service');

const getAllAccount = async (req, res, next) => {
  let { user_id } = req.tokenPayload;
  try {
    let accounts = await customerService.getAllAccount(user_id);
    res.status(200).send(accounts);
  } catch (error) {
    next(error);
  }
}

const getOneAccountByAccountNumber = async (req, res, next) => {
  let { account_number } = req.params;
  try {
    let account = await customerService.getOneAccountByAccountNumber(account_number);
    res.status(200).send(account);
  } catch (error) {
    next(error);
  }
}
const createSaveAccount = async (req, res, next) => {
  let { account_name, account_object } = req.body;
  let { user_id } = req.tokenPayload;
  try {
    let account = await customerService.createSaveAccount(account_name, account_object, user_id);
    res.status(200).send(account);
  } catch (error) {
    next(error);
  }
}

const deleteAccount = async (req, res, next) => {
  let account_number = req.params.account_number;
  try {
    let rs = await customerService.deleteAccount(account_number);
    res.status(200).send(rs);
  } catch (error) {
    next(error);
  }
}
const changeAccountName = async (req, res, next) => {
  try {
    let result = await customerService.changeAccountName(req.params.account_number, req.body.account_name);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

const getAllReceiverOfUser = async (req, res, next) => {
  let { user_id } = req.tokenPayload;
  try {
    let receivers = await customerService.getAllReceiverOfUser(user_id);
    res.status(200).send(receivers);
  } catch (error) {
    next(error);
  }
}

const getReceiverById = async (req, res, next) => {
  let { receiver_id } = req.params;
  try {
    let receiver = await customerService.getReceiverById(receiver_id);
    res.status(200).send(receiver);
  } catch (error) {
    next(error);
  }
}

const updateReceiver = async (req, res, next) => {
  let { name } = req.body;
  let { receiver_id } = req.params;
  try {
    let update = await customerService.updateReceiver(receiver_id, name);
    res.status(200).send(update);
  } catch (error) {
    next(error);
  }
}

const deleteReceiver = async (req, res, next) => {
  let { receiver_id } = req.params;
  try {
    let delReceiver = await customerService.deleteReceiver(receiver_id);
    res.status(200).send(delReceiver);
  } catch (error) {
    next(error);
  }
}

const createReceiver = async (req, res, next) => {
  let { name, account_number, bank } = req.body;
  const { user_id } = req.tokenPayload;
  try {
    let receiver;
    if (bank === 'S2Q Bank') {
      console.log('create inner receiver')
      receiver = await customerService.createInnerReceiver(user_id, account_number, name);
    } else {

    }
    res.status(201).send(receiver);
  } catch (error) {
    next(error);
  }
}

const getAllDebtReminder = async (req, res, next) => {
  let { user_id } = req.tokenPayload;
  try {
    let debts = await customerService.getAllDebtReminder(user_id);
    res.status(200).send(debts);
  } catch (error) {
    next(error);
  }
}
const createDebtReminder = async (req, res, next) => {
  try {
    let { user_id } = req.tokenPayload;
    let reminder = {
      user_id,
      owner_account_number: req.body.src_account_number,
      debtor_account_number: req.body.des_account_number,
      description: req.body.description,
      amount: req.body.amount
    }
    let rs = await customerService.createDebtReminder(reminder);
    res.status(200).send(rs);
  } catch (error) {
    next(error);
  }
}

const cancelDebtReminder = async (req, res, next) => {
  try {
    let rs = await customerService.cancelReminder(req.params.receiver_id, req.body.description);
    res.status(200).send(rs);
  } catch (error) {
    next(error);
  }
}

const deleteDebtReminder = async (req, res, next) => {
  try {
    let ret = await customerService.deleteDebtReminder(req.params.reminder_id);
    res.status(200).send(ret);
  } catch (error) {
    next(error);
  }
}

const getUserInfoByAccountNumber = async (req, res, next) => {
  let { account_number } = req.params;
  let { bank } = req.query;
  try {
    let user = bank ?
      bank === 'S2Q Bank' ?
        await customerService.getUserInfoByAccountNumber(account_number) :
        await partnerService.requestInfoPartnerBank(account_number, bank) :
      await customerService.getUserInfoByAccountNumber(account_number);
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
}

const getAllBankName = async (req, res, next) => {
  try {
    let result = await customerService.getAllBankName();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

/** TODO:
 * Thanh toan no
 * Chuyen khoan
 */

// session không thể chạy nếu trong đó chưa một operator tạo một collection mới 
module.exports = {
  getAllAccount,
  getOneAccountByAccountNumber,
  createSaveAccount,
  deleteAccount,
  changeAccountName,
  getAllReceiverOfUser,
  getReceiverById,
  updateReceiver,
  deleteReceiver,
  createReceiver,
  createDebtReminder,
  cancelDebtReminder,
  getAllDebtReminder,
  deleteDebtReminder,
  getUserInfoByAccountNumber,
  getAllBankName,
}

