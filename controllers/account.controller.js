const db = require('../utils/db');
const Account = require('../models/schema/account');
const User = require('../models/schema/user');
const Transaction = require('../models/schema/transaction');
const moment = require('moment');
const { generateAccountNumber, generateTransactionNumber } = require('../utils/generator');


module.exports = {
  getAllAccount: async user_id => {
    try {
      return await db.find({ model: Account, data: { user_id } });
    } catch (error) {
      throw error;
    }
  },
  getOneAccountByAccountNumber: async account_number => {
    try {
      let account = await db.find({ model: Account, data: { account_number } });
      return account.attribute_data[0];
    } catch (error) {
      throw error;
    }
  },
  createAccount: async (account_name, user_id) => {
    let account_number = generateAccountNumber();
    let account = {
      account_number,
      account_name,
      user_id,
    };
    const session = await Account.startSession();
    session.startTransaction();
    try {
      const options = { session };
      const newAcc = await Account(account).save(options);
      const updateUser = await User.findOneAndUpdate(
        { _id: user_id },
        { $push: { accounts: newAcc._id } },
        options
      );
      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        account_number: newAcc.account_number,
        user_id: user_id
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw { success: false, error };
    }
  },
  deleteAccount: async account_number => {
    try {
      let account = await db.find({ model: Account, data: { account_number } });
      if (account.amount > 0) {
        throw { status: 403, success: false, message: "Account can't be deleted, due to account balance" };
      }
      const session = await Account.startSession();
      session.startTransaction();
      const options = { session };
      await Account.findOneAndDelete({ _id: account._id }, options);
      await User.findOneAndUpdate({ _id: account.user_id }, { $pull: { accounts: account_number } });
      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        account_number
      }
    } catch (error) {
      throw error;
    }
  },
  changeAccountName: async (account_number, account_name) => {
    try {
      let rs = await Account.findOneAndUpdate({ account_number }, { account_name });
      return {
        success: true,
        result: rs
      };
    } catch (error) {
      throw error;
    }
  },
  makeTransaction: async (transaction) => {
    /** Chuyen tien trong ngan hang
     * 1. Check ma OTP bên route
     * 2. thêm tiền vào tài khoản đích
     * 3. trừ tiền trong tài khoản nguồn
     * 4. thêm mã transaction
     * 5. thêm vào transaction
     */
    const session = await Account.startSession();
    session.startTransaction();
    const { feePayBySender, amount, fee, src_acc, des_acc, src_bank, des_bank } = transaction;
    try {
      const options = { session };
      let amount_inc = feePayBySender ? amount : amount - fee;
      let amount_dec = feePayBySender ? amount + fee : amount;
      await Account.findOneAndUpdate(
        { account_number: des_acc },
        { $inc: { amount: amount_inc } },
        session
      );
      await Account.findOneAndUpdate(
        { account_number: src_acc },
        { $inc: { amount: -amount_dec } },
        options
      );
      // TODO: test rollback
      let transaction_number = generateTransactionNumber();
      let transaction = {
        transaction_number,
        src_number: src_acc,
        src_bank,
        des_bank,
        amount,
        description: transaction.description,
        day: moment(new Date()).format("DD-MM-YYYY HH:mm:ss"),
        fee,
        transaction_type: transaction.type
      };
      await Transaction(transaction).save(options);
      await session.commitTransaction();
      session.endSession();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}