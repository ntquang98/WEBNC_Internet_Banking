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
    let transaction_number = generateTransactionNumber();
    let new_transaction = {
      transaction_number,
      src_number: src_acc,
      src_bank,
      des_number: des_acc,
      des_bank,
      amount,
      description: description,
      day: moment(new Date()).format("DD-MM-YYYY HH:mm:ss"),
      fee: 0,
      transaction_type: type
    };
    await Transaction(new_transaction).save(options);
    let notify = _getTransferNotification(receiver, amount, new_transaction.day, description, type);
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
    const { feePayBySender, amount, fee, src_acc, des_acc, src_bank, des_bank, type } = transaction;
    let amount_inc = feePayBySender ? amount : amount - fee;
    let amount_dec = feePayBySender ? amount + fee : amount;
    console.log(amount_inc, amount_dec, feePayBySender);
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
      description: transaction.description,
      day: moment(new Date()).format("DD-MM-YYYY HH:mm:ss"),
      fee,
      transaction_type: type
    };
    console.log('transaction_number', transaction_number)
    let result = await Transaction(new_transaction).save(options);
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
  const { feePayBySender, amount, fee, src_acc, des_acc, src_bank, des_bank, type } = transaction;
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
    let { request, response } = await PartnerService.sendMoneyToPartnerBank(src_acc, des_acc, amount_inc, des_bank);
    let transaction_number = generateTransactionNumber();
    let new_transaction = {
      transaction_number,
      src_number: src_acc,
      src_bank,
      des_number: des_acc,
      des_bank,
      amount,
      description: transaction.description,
      day: moment(new Date()).format("DD-MM-YYYY HH:mm:ss"),
      fee,
      transaction_type: type
    };
    await Transaction(new_transaction).save(options);

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

const _getTransferNotificationContent = (sender, receiver, amount, day, description, type) => {
  let senderContent = `Số dư tài khoản vừa giảm ${amount} vào ${day} số dư hiện tại ${sender.amount}. Mô tả ${description}`;
  let receiverContent = receiver && `Số dư tài khoản vừa tăng ${amount} vào ${day} số dư hiện tại ${receiver.amount}. Mô tả ${description}`;
  let senderNotify = {
    user_id: sender.user_id,
    content: senderContent,
    type: type,
    create_at: moment().unix(),
    is_hide: false,
    is_seen: false
  };
  let receiverNotify = receiver && {
    user_id: receiver.user_id,
    content: receiverContent,
    type: type,
    create_at: moment().unix(),
    is_hide: false,
    is_seen: false
  }
  if (receiver)
    return [senderNotify, receiverNotify];
  else
    return [senderNotify];
}

const _getTransferNotification = (receiver, amount, day, description, type) => {
  let receiverContent = `Số dư tài khoản vừa tăng ${amount} vào ${day} số dư hiện tại ${receiver.amount}. Mô tả ${description}`;
  let receiverNotify = {
    user_id: receiver.user_id,
    content: receiverContent,
    type: type,
    create_at: moment().unix(),
    is_hide: false,
    is_seen: false
  }
  return [receiverNotify];
}

const _createNotification = async (sender, receiver, amount, day, description, type) => {
  try {
    let notifies = _getTransferNotificationContent(sender, receiver, amount, day, description, type)
    await Notification.insertMany(notifies);
  } catch (error) {
    throw createError(500, 'Server Error');
  }
}

const requestTransaction = async (user_id) => {
  // Gui OTP
  try {
    let user = await User.findById(user_id);
    if (!user) throw createError(404, 'Can not find User');
    await AuthService.sendOTP(user.email, "Transaction", "Verification transfer operation");

    return {
      ok: true,
      message: 'Go to next steps',
    };

  } catch (error) {
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
    let trans = transaction.des_bank === 'S2Q Bank' ?
      await _doingInnerTransfer(transaction, options) :
      await _doingOuterTransfer(transaction, options);
    await _createNotification(trans.sender, trans.receiver, transaction.amount, trans.new_transaction.day, transaction.description);
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
    const { amount, debtor_account_number, owner_account_number } = reminder;
    let transaction = {
      src_acc: debtor_account_number,
      des_acc: owner_account_number,
      src_bank: 'S2Q Bank',
      des_bank: 'S2Q Bank',
      type: 'PAY_DEBT',
      amount: amount,
      fee: 0,
      feePayBySender: true,
    };

    let trans = await _doingInnerTransfer(transaction, options);
    await DebtReminder.findByIdAndUpdate(debtId, { is_done: true }, options);
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
      day: moment(new Date()).format("DD-MM-YYYY HH:mm:ss"),
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

    console.log(new_req, new_res);

    let notifies = _getTransferNotification(receiver, amount_inc, new_transaction.day, description);
    await Notification.insertMany(notifies);

    await session.commitTransaction();
    session.endSession();
    return ret;
  } catch (error) {
    console.log(error)
    await session.abortTransaction();
    session.endSession();
    throw createError(500, 'Server Errors');
  }
}

const getTransactionHistory = async account_number => {
  try {
    let receiver_money = await Transaction.find({ des_acc: account_number, type: 'TRANSFER' });
    let send_money = await Transaction.find({ src_acc: account_number, type: 'TRANSFER' });
    let saving = await Transaction.find({ src_acc: account_number, type: 'SAVING' });
    let withdraw_from_save = await Transaction.find({ des_acc: account_number, type: 'WITHDRAW' });
    let pay_debt = await Transaction.find({ src_acc: account_number, type: 'PAY_DEBT' });
    return {
      receiver_money,
      send_money,
      saving,
      withdraw_from_save,
      pay_debt
    }
  } catch (error) {
    throw createError(500, 'Server Errors');
  }
}

module.exports = {
  makeTransaction,
  requestTransaction,
  handlePartnerRequest,
  getTransactionHistory,
  sendMoneyToAccount,
  payDebt,
}