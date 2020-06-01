const mongoose = require("mongoose");
const db = require('../utils/db');
const User = require('../models/schema/user');
const Account = require('../models/schema/account');
const moment = require('moment');
const { generateAccountNumber } = require('../utils/generator');

// session không thể chạy nếu trong đó chưa một operator tạo một collection mới 
module.exports = {
  create_customer: async (new_user) => {
    const session = await User.startSession();
    session.startTransaction();
    try {
      const options = { session };
      const user = await User(new_user).save(options);
      const account = await Account({
        account_number: generateAccountNumber(),
        account_type: 'deposit',
        user_id: user._id
      }).save(options);
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
      throw { success: false, error }
    }
  }
}

