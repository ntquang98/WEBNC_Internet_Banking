/** TODO:
 * 1. inner transaction service
 * 2. outer transaction service by bank name
 * 2.1 -> 2.n : outer transaction by bank ...
 * 3. pay debt
 * 4. deposit and withdraw save account to deposit account
 * 5. notification service
 * 6.
 */
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

const { generateTransactionNumber } = require('../utils/generator');

const _checkOTPOfUser = async (OTP, user_id, options = null) => {
  let user = await User.findOne({ _id: user_id, otp: OTP }, options);
  if (!user) {
    throw createError[404];
  }
  if (user.otp_exp > moment().unix()) {
    throw createError(400, 'The OTP is now invalid');
  }
}

const _doingInnerTransfer = async (transaction, options) => {
  try {
    const { feePayBySender, amount, fee, src_acc, des_acc, src_bank, des_bank, type } = transaction;
    let amount_inc = feePayBySender ? amount : amount - fee;
    let amount_dec = feePayBySender ? amount + fee : amount;
    let sender = await Account.findOneAndUpdate(
      { account_number: des_acc },
      { $inc: { amount: amount_inc } },
      options
    );
    let receiver = await Account.findOneAndUpdate(
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
    await Transaction(new_transaction).save(options);
    return {
      sender,
      receiver,
      new_transaction
    };
  } catch (error) {
    throw createError[500];
  }
}

const _getTransferNotificationContent = (sender, receiver, amount, day, description) => {
  let senderContent = `Số dư tài khoản vừa giảm ${amount} vào ${day} số dư hiện tại ${sender.amount}. Mô tả ${description}`;
  let receiverContent = `Số dư tài khoản vừa tăng ${amount} vào ${day} số dư hiện tại ${receiver.amount}. Mô tả ${description}`;
  let senderNotify = {
    user_id: sender.user_id,
    content: senderContent,
    type: 'TRANSFER',
    create_at: moment().unix(),
    is_hide: false,
    is_seen: false
  };
  let receiverNotify = {
    user_id: receiver.user_id,
    content: receiverContent,
    type: 'TRANSFER',
    create_at: moment().unix(),
    is_hide: false,
    is_seen: false
  }
  return [senderNotify, receiverNotify];
}

const _createNotification = async (sender, receiver, amount, day, description) => {
  let notifies = _getTransferNotificationContent(sender, receiver, amount, day, description)
  await Notification.insertMany(notifies);
}

/**
 * 1. Đầu tiên điền thông tin tài khoản thụ hưởng.
 * 2. Tiếp theo sẽ Query thông tin người thụ hưởnghưởng GET /customer/customers/:account_number
 * 3. Cho người dùng kiểm tra lại thông tin
 * 4. Nhập mã OTP
 * 5. Gửi mã OTP kèm thông tin người thụ hưởng cho backend
 * -> Xử lí tại đây`
 */
const makeInnerTransaction = async (OTP, user_id, transaction) => {
  const session = await Account.startSession();
  session.startTransaction();
  try {
    const options = { session };
    await _checkOTPOfUser(OTP, user_id, options);
    let trans = await _doingInnerTransfer(transaction, options);
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



module.exports = {

}