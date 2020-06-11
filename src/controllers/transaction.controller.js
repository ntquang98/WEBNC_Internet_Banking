const TransactionService = require('../services/transaction.service');

const requestTransaction = async (req, res, next) => {
  let { user_id } = req.tokenPayload;
  try {
    let ret = await TransactionService.requestTransaction(user_id);
    res.status(200).send(ret);
  } catch (error) {
    next(error);
  }
}

const makeTransaction = async (req, res, next) => {
  try {
    let { user_id } = req.tokenPayload;
    let { OTP, source_account, destination_account, destination_bank, amount, isFeePayBySender, fee } = req.body;
    let transaction = {
      feePayBySender: isFeePayBySender,
      amount,
      fee,
      src_acc: source_account,
      des_acc: destination_account,
      src_bank: 'S2Q Bank',
      des_bank: destination_bank,
      type: 'TRANSFER'
    };

    let result = await TransactionService.makeTransaction(OTP, user_id, transaction);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

const payDebt = async (req, res, next) => {
  try {
    let { user_id } = req.tokenPayload;
    let { OTP, debtId } = req.body;
    let result = await TransactionService.payDebt(OTP, user_id, debtId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

const getHistory = async (req, res, next) => {
  try {
    let { account_number } = req.params;
    let ret = await TransactionService.getTransactionHistory(account_number);
    res.status(200).send(ret);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requestTransaction,
  makeTransaction,
  getHistory,
  payDebt
}