const User = require('../models/schema/user');
const Account = require('../models/schema/account');
const Notification = require('../models/schema/notification');
const generator = require('../utils/generator');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const transactionService = require('./transaction.service');
const notifyFactory = require('../utils/notificationHelper');

const createCustomer = async info => {
  let {
    full_name,
    email,
    phone
  } = info;
  let password = generator.generatePassword();
  let username = generator.generateUserName();

  let new_user = {
    user_name: username,
    password: bcrypt.hashSync(password, 8),
    full_name,
    email,
    phone,
    user_role: 'customer'
  }

  const session = await User.startSession();
  session.startTransaction();
  try {
    const options = { session };
    const oldUser = await User.findOne({
      email
    });
    if (oldUser) {
      // this user is used;
      throw createError(400, { message: 'This email have been used' });
    }
    const user = await User(new_user).save(options);
    if (!user) {
      throw createError(422, 'Can not create user account');
    }
    const account = await Account({
      account_number: generator.generateAccountNumber(),
      account_type: 'deposit',
      user_id: user._id
    }).save(options);

    if (!account) {
      throw createError(422, 'can not create user account');
    }
    const updateUser = await User.findOneAndUpdate({ _id: user._id }, { $push: { accounts: account._id } }, options);
    await session.commitTransaction();
    session.endSession();
    return {
      success: true,
      user_id: user._id,
      username,
      password,
      email,
      full_name,
      phone,
      account_number: account.account_number
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.status) throw error;
    throw createError(500, 'Server Errors');
  }
}

const sendMoneyToCustomerAccount = async (account_number, amount) => {
  try {
    let account = await Account.findOne({ account_number });
    let transaction = {
      src_acc: 'S2Q',
      src_bank: 'S2Q Bank',
      des_acc: account_number,
      amount,
      type: 'TRANSFER',
      description: 'Nạp tiền tại quầy giao dịch',
    }
    let ret = transactionService.sendMoneyToAccount(transaction);

    let notify = notifyFactory.createReceiveMoneyNotification(account.user_id, amount, 'S2Q Bank', transaction.description);
    await Notification(notify).save();

    return ret;
  } catch (error) {
    throw error;
  }
}

const getUserInformation = async email => {
  try {
    let user = await User.findOne({ email });
    if (!user) {
      throw createError(404, 'Not find user');
    }
    let accounts = await Account.find({ _id: { $in: user.accounts } });
    return {
      info: {
        user_name: user.user_name,
        full_name: user.full_name,
        phone_number: user.phone_number,
      },
      accounts
    }
  } catch (error) {
    throw error;
  }
}

const getAccountTransactionHistories = async (account_number, transactionType = null) => {
  try {
    console.log('transactionType', transactionType)
    let ret = transactionService.getTransactionHistory(account_number, transactionType);
    return ret;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createCustomer,
  sendMoneyToCustomerAccount,
  getUserInformation,
  getAccountTransactionHistories
}
