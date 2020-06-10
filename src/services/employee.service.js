const User = require('../models/schema/user');
const Account = require('../models/schema/account');
const { generateAccountNumber } = require('../utils/generator');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const transactionService = require('./transaction.service');

const createCustomer = async newUser => {
  newUser.user_role = 'customer';
  newUser.password = bcrypt.hashSync(newUser.password, 8);
  const session = await User.startSession();
  session.startTransaction();
  try {
    const options = { session };
    const oldUser = await User.findOne({
      email: newUser.email
    });
    if (oldUser) {
      // this email is used;
      throw createError(400, 'This email have been used');
    }
    const user = await User(newUser).save(options);
    if (!user) {
      throw createError[404];
    }
    const account = await Account({
      account_number: generateAccountNumber(),
      account_type: 'deposit',
      user_id: user._id
    }).save(options);

    if (!account) {
      throw createError[422];
    }
    const updateUser = await User.findOneAndUpdate({ _id: user._id }, { $push: { accounts: account._id } }, options);
    await session.commitTransaction();
    session.endSession();
    return {
      success: true,
      user_id: user._id,
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
    let transaction = {
      src_acc: 'S2Q',
      src_bank: 'S2Q Bank',
      des_acc: account_number,
      amount,
      type: 'TRANSFER',
      description: 'Nạp tiền tại quầy giao dịch',
    }
    let ret = transactionService.sendMoneyToAccount(transaction);
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
    let accounts = await Account.find({ _id: { $in: user.accounts } }).toArray();
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

const getAccountTransactionHistories = async account_number => {
  try {
    let ret = transactionService.getTransactionHistory(account_number);
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