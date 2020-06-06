const User = require('../models/schema/user');
const Account = require('../models/schema/account');
const { generateAccountNumber } = require('../utils/generator');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');

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
      throw createError[400];
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
    throw createError[500];
  }
}

module.exports = {
  createCustomer,
}