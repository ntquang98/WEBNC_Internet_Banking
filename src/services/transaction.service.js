const moment = require('moment');
const createError = require('http-errors');

const User = require('../models/schema/user');
const Account = require('../models/schema/account');
const Transaction = require('../models/schema/transaction');
const RequestLog = require('../models/schema/request_log');
const ResponseLog = require('../models/schema/response_log');
const PartnerRequestLog = require('../models/schema/partner_request_log');
const PartnerResponseLog = require('../models/schema/partner_response_log');
const Notification = require('../models/schema/notification');
const DebtReminder = require('../models/schema/debt_reminder');
const MyBank = require('../models/schema/my_bank');

const PartnerService = require('./partner.service');
const AuthService = require('./auth.service');

const security = require('../utils/security');

const { generateTransactionNumber } = require('../utils/generator');
const notifyFactory = require('../utils/notificationHelper');

const _checkOTPOfUser = async (OTP, user_id, options = null) => {
  try {
    let user = await User.findOne({ _id: user_id, otp: OTP }, null, options);
    if (!user) {
      throw createError(404, 'Can not find User or OTP is not found');
    }
    if (user.otp_exp < moment().unix()) {
      throw createError(400, 'The OTP is now invalid');
    }
    await User.findByIdAndUpdate(user_id, { otp: '' }, options);
  } catch (error) {
    throw error;
  }
}

const sendMoneyToAccount = async (transaction) => {
  const session = await Account.startSession();
  session.startTransaction();
  try {
    const options = { session };
    const { amount, src_acc, des_acc, src_bank, des_bank, type, description } = transaction;

    let receiver = await Account.findOneAndUpdate(
      { account_number: des_acc },
      { $inc: { amount: amount } },
      options
    );
    let new_transaction = {
      transaction_number: generateTransactionNumber(),
      src_number: src_acc,
      src_bank,
      des_number: des_acc,
      des_bank,
      amount,
      description: description,
      day: Date.now(),
      fee: 0,
      transaction_type: type
    };

    await Transaction(new_transaction).save(options);

    let notify = notifyFactory.createSendMoneyNotification(receiver.user_id, amount, receiver.amount, description);
    await Notification.insertMany(notify);

    await session.commitTransaction();
    return new_transaction;
  } catch (error) {
    await session.abortTransaction();
    throw createError(500, 'Server Error');
  } finally {
    session.endSession();
  }
}

const _doingInnerTransfer = async (transaction, options) => {
  try {
    const { feePayBySender, amount, fee, src_acc, des_acc, src_bank, des_bank, type, description } = transaction;

    let amount_inc = feePayBySender ? amount : amount - fee;
    let amount_dec = feePayBySender ? amount + fee : amount;

    let user_send = await Account.findOne({ account_number: src_acc }, null, options);
    if (!user_send) {
      throw createError(404, 'Can not find user');
    }
    if (user_send.amount < amount_dec) {
      throw createError(400, 'Bank account does not have enough money');
    }

    let receiver = await Account.findOneAndUpdate(
      { account_number: des_acc },
      { $inc: { amount: amount_inc } },
      options
    );
    let sender = await Account.findOneAndUpdate(
      { account_number: src_acc },
      { $inc: { amount: -amount_dec } },
      options
    );
    let transaction_number = generateTransactionNumber();
    let new_transaction = {
      transaction_number,
      src_number: src_acc,
      src_bank,
      des_number: des_acc,
      des_bank,
      amount,
      description: description,
      day: Date.now(),
      fee,
      transaction_type: type
    };
    let result = await Transaction(new_transaction).save(options);

    let notifySender = notifyFactory.createSendMoneyNotification(sender.user_id, amount_dec, sender.amount, description);
    let notifyReceiver = notifyFactory.createReceiveMoneyNotification(receiver.user_id, amount_inc, receiver.amount, description);

    await Notification.insertMany([notifySender, notifyReceiver]);

    return {
      result,
      sender,
      receiver,
      new_transaction
    };
  } catch (error) {
    if (error.status) throw error;
    throw createError(500, error);
  }
}

const _doingOuterTransfer = async (transaction, options) => {
  const { feePayBySender, amount, fee, src_acc, des_acc, src_bank, des_bank, type, description, toFullName, user_id } = transaction;
  let amount_inc = feePayBySender ? amount : amount - fee;
  let amount_dec = feePayBySender ? amount + fee : amount;
  try {
    let checkAccount = await Account.findOne({ account_number: src_acc });
    if (checkAccount.amount < amount_dec) {
      throw createError(400, 'Account balance is not enough for transaction');
    }
    let sender = await Account.findOneAndUpdate(
      { account_number: src_acc },
      { $inc: { amount: -amount_dec } },
      options
    );
    let { request, response } = await PartnerService.sendMoneyToPartnerBank(src_acc, des_acc, amount_inc, des_bank, description, feePayBySender, fee, toFullName, user_id);
    let transaction_number = generateTransactionNumber();
    let new_transaction = {
      transaction_number,
      src_number: src_acc,
      src_bank,
      des_number: des_acc,
      des_bank,
      amount,
      description: transaction.description,
      day: Date.now(),
      fee,
      transaction_type: type
    };
    await Transaction(new_transaction).save(options);

    let notify = notifyFactory.createSendMoneyNotification(sender.user_id, amount_dec, sender.balance, description);
    await Notification(notify).save();

    request.transaction_number = transaction_number;
    await PartnerRequestLog(request).save(options);
    response.transaction_number = transaction_number;
    await PartnerResponseLog(response).save(options);
    return {
      sender,
      new_transaction,
    }
  } catch (error) {
    throw error;
  }
}

const requestTransaction = async (user_id) => {
  try {
    let user = await User.findById(user_id);
    if (!user) throw createError(404, 'Can not find User');

    await AuthService.sendOTP(user_id, user.email, "Transaction", "Verification transfer operation");

    return {
      ok: true,
      message: 'Go to next steps',
    };

  } catch (error) {
    console.log(error)
    if (error.status) throw error;
    throw createError(500, "Server errors");
  }
}

const makeTransaction = async (OTP, user_id, transaction) => {
  const session = await Account.startSession();
  session.startTransaction();
  try {
    const options = { session };
    if (OTP) {
      await _checkOTPOfUser(OTP, user_id, options);
    }
    transaction.user_id = user_id;
    let trans = transaction.des_bank === 'S2Q Bank' ?
      await _doingInnerTransfer(transaction, options) :
      await _doingOuterTransfer(transaction, options);

    await session.commitTransaction();
    session.endSession();
    return trans.new_transaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

const payDebt = async (OTP, user_id, debtId) => {
  const session = await Account.startSession();
  session.startTransaction();
  try {
    const options = { session };
    await _checkOTPOfUser(OTP, user_id, options);
    let reminder = await DebtReminder.findOne({ _id: debtId, receiver_id: user_id }, null, options);
    if (!reminder) {
      throw createError(404, 'Not find Debt Reminder');
    }
    const {
      amount,
      debtor_account_number,
      owner_account_number,
      sender_name,
      receiver_name,
      sender_id,
      receiver_id
    } = reminder;

    let transaction = {
      src_acc: debtor_account_number,
      des_acc: owner_account_number,
      src_bank: 'S2Q Bank',
      des_bank: 'S2Q Bank',
      type: 'PAY_DEBT',
      amount: parseInt(amount),
      fee: 0,
      feePayBySender: true,
    };

    let trans = await _doingInnerTransfer(transaction, options);
    await DebtReminder.findByIdAndUpdate(debtId, { is_done: true }, options);

    let notify1 = createNotificationObject({
      user_id: sender_id,
      type: 'GET_DEBT',
      amount, receiver_name, debtor_account_number
    });

    let notify2 = createNotificationObject({
      user_id: receiver_id,
      type: 'PAY_DEBT',
      amount, sender_name, owner_account_number
    })

    await Transaction(transaction).save(options);
    await Notification.insertMany([notify1, notify2]);
    await session.commitTransaction();
    session.endSession();
    return trans.new_transaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

const handlePartnerRequest = async (header, body, signature, transaction) => {
  const session = await Account.startSession();
  session.startTransaction();
  try {
    const { feePayBySender, amount, fee, src_acc, des_acc, src_bank, des_bank, type, description } = transaction;
    const options = { session }
    let amount_inc = feePayBySender ? amount : amount - fee;
    let receiver = await Account.findOneAndUpdate(
      { account_number: des_acc },
      { $inc: { amount: amount_inc } },
      options
    );
    if (!receiver) {
      throw createError(404, 'Can not find account number');
    }
    let transaction_number = generateTransactionNumber();
    let new_transaction = {
      transaction_number,
      src_number: src_acc,
      src_bank,
      des_number: des_acc,
      des_bank,
      amount,
      description,
      day: Date.now(),
      fee,
      transaction_type: type
    };
    await Transaction(new_transaction).save(options);
    let myBank = await MyBank.findOne({ bank_name: 'S2Q Bank' });
    let private_key = myBank.private_key_rsa.replace(/\\n/g, '\n');
    let sig = security.encrypt(new_transaction, 'sha256', private_key, 'hex');

    let ret = {
      data: new_transaction,
      signature: sig
    }

    let req = {
      transaction_number,
      partner_name: src_bank,
      request_header: header,
      request_body: body,
      request_time: new_transaction.day,
      signature,
      request_amount: amount_inc
    }
    let new_req = await RequestLog(req).save(options);

    let res = {
      transaction_number,
      partner_name: src_bank,
      response_body: new_transaction,
      response_time: new_transaction.day,
      signature: sig
    }
    let new_res = await ResponseLog(res).save(options);

    let notifies = notifyFactory.createReceiveMoneyNotification(receiver.user_id, amount_inc, receiver.amount, description);
    await Notification(notifies).save();

    await session.commitTransaction();
    session.endSession();
    return ret;
  } catch (error) {
    console.log(error)
    await session.abortTransaction();
    session.endSession();
    if (error.status) throw error;
    throw createError(500, 'Server Errors');
  }
}

const getTransactionHistory = async account_number => {
  try {
    let histories = await Transaction.find().or([
      { src_number: account_number },
      { des_number: account_number }
    ]);
    return histories.reverse(); // order new -> old
  } catch (error) {
    throw createError(500, 'Server Errors');
  }
}

const saveMoney = async (user_id, account_number, save_account_number, amount) => {
  const session = await Account.startSession();
  session.startTransaction()
  try {
    let options = { session };
    amount = parseInt(amount);
    let deposit = await Account.findOne({ account_number: account_number });
    console.log(deposit)
    if (!deposit) {
      throw createError(404, 'Cannot find account');
    }
    if (deposit.amount < amount) {
      throw createError(400, 'Account does not have enough money');
    }

    let update = await Account.findByIdAndUpdate(deposit._id, { $inc: { amount: -amount } }, options);
    let updateSave = await Account.findOneAndUpdate({ account_number: save_account_number }, { $inc: { amount: amount } }, options);
    let transaction = {
      transaction_number: generateTransactionNumber(),
      src_number: account_number,
      des_number: save_account_number,
      src_acc: 'S2Q Bank',
      des_bank: 'S2Q Bank',
      amount: amount,
      description: 'SAVING',
      day: Date.now(),
      fee: 0,
      transaction_type: 'SAVING'
    };

    await Transaction(transaction).save(options);
    let notify = notifyFactory.createSaveNotification(user_id, amount, update.account_name);

    await Notification(notify).save();
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      account: update,
      save: updateSave,
      transaction: transaction.transaction_number
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    throw error;
  }
}

const withDrawMoney = async (user_id, account_number, save_account_number, amount) => {
  const session = await Account.startSession();
  session.startTransaction()
  try {
    let options = { session };
    let save = await Account.findOne({ account_number: save_account_number });
    if (!save) {
      throw createError(404, 'Cannot find account');
    }
    if (save.amount < amount) {
      throw createError(400, 'Account does not have enough money');
    }

    let update = await Account.findByIdAndUpdate(save._id, { $inc: { amount: -amount } }, options);
    let updateDeposit = await Account.findOneAndUpdate({ account_number: account_number }, { $inc: { amount: amount } }, options);
    let transaction = {
      transaction_number: generateTransactionNumber(),
      src_number: save_account_number,
      des_number: account_number,
      src_acc: 'S2Q Bank',
      des_bank: 'S2Q Bank',
      amount: amount,
      description: 'WITHDRAW',
      day: Date.now(),
      fee: 0,
      transaction_type: 'WITHDRAW'
    };

    let t = await Transaction(transaction).save(options);

    let notify = notifyFactory.createWithDrawNotification(user_id, amount, update.account_name);

    await Notification(notify).save();
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      save: update,
      account: updateDeposit,
      transaction: t.transaction_number
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    throw error;
  }

}

module.exports = {
  makeTransaction,
  requestTransaction,
  handlePartnerRequest,
  getTransactionHistory,
  sendMoneyToAccount,
  payDebt,
  saveMoney,
  withDrawMoney
}
