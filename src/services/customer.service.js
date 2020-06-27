const Account = require('../models/schema/account');
const User = require('../models/schema/user');
const DebtReminder = require('../models/schema/debt_reminder');
const Notification = require('../models/schema/notification');
const ReceiverList = require('../models/schema/receiver_list');
const Bank = require('../models/schema/bank');

const moment = require('moment');
const createError = require('http-errors');

const {generateAccountNumber} = require('../utils/generator');

const bcrypt = require('bcryptjs');

const getAllAccount = async user_id => {
  try {
    let accounts = await Account.find({user_id});
    if (accounts.length > 0) {
      return accounts;
    }
    throw createError(404, 'Not found');
  } catch (error) {
    throw createError(500, 'Server Errors');
  }
}

const getOneAccountByAccountNumber = async account_number => {
  try {
    let account = await Account.findOne({account_number});
    if (!account) {
      throw createError(404, 'Can not find account');
    }
    return account;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw createError(500, 'Server Errors');
  }
}

const createSaveAccount = async (account_name, account_object, user_id) => {
  const session = await Account.startSession();
  session.startTransaction();
  try {
    let account = {
      account_number: generateAccountNumber(),
      account_name,
      account_object,
      user_id,
    };
    const options = {session};
    const newAccount = await Account(account).save(options);
    const updateUser = await User.findOneAndUpdate(
      {_id: user_id},
      {$pull: {accounts: newAccount._id}},
      options
    );
    await session.commitTransaction();
    session.endSession();
    return {
      success: true,
      user_id,
      account_number: newAccount.account_number,
      account_name: newAccount.account_name,
      account_object: newAccount.account_object
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw createError[500];
  }
}

const deleteAccount = async account_number => {
  try {
    let account = await Account.findOne({account_number});
    if (account.amount > 0 || account.account_type !== 'save') {
      throw createError(400, "Account can not be deleted");
    }
    const session = await Account.startSession();
    session.startTransaction();
    const options = {session};
    await Account.findByIdAndDelete(account._id, options);
    await User.findOneAndUpdate({_id: account.user_id}, {$pull: {accounts: account._id}}, options);
    await session.commitTransaction();
    session.endSession();
    return {
      success: true,
      deleted_account: account_number,
    };
  } catch (error) {
    throw error;
  }
}

const changeAccountName = async (account_number, account_name) => {
  const session = await Account.startSession();
  session.startTransaction();
  try {
    const options = {session, new: true};
    let rs = await Account.findOneAndUpdate({account_number}, {account_name}, options);
    if (rs.account_type !== 'save') {
      throw createError(400, 'Can not change name of deposit account');
    }
    await session.commitTransaction();
    session.endSession();
    return {
      success: true,
      result: rs
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.status) throw error;
    throw createError[500];
  }
}

const getAllDebtReminder = async user_id => {
  try {
    let debt = await DebtReminder.find({receiver_id: user_id});
    let own = await DebtReminder.find({sender_id: user_id});
    return {
      debt,
      own,
    };
  } catch (error) {
    throw createError[500];
  }
}

const createDebtReminder = async reminder => {
  let {user_id, owner_account_number, debtor_account_number, amount, description} = reminder;
  const session = await DebtReminder.startSession();
  session.startTransaction();
  try {
    let day = new Date();
    const options = {session};
    const sender = await User.findById(user_id);
    if (!sender) throw createError(404, {message: "Cannot find User"});
    const receiverAccount = await Account.findOne({account_number: debtor_account_number});
    const receiver = await User.findOne({accounts: receiverAccount._id});
    if (!receiver) throw createError(404, {message: "can not find user"});
    let remind = {
      owner_account_number,
      debtor_account_number,
      sender_id: user_id,
      receiver_id: receiver._id,
      sender_name: sender.full_name,
      receiver_name: receiver.full_name,
      amount,
      description,
      day,
      is_done: false,
      is_cancel: false,
    }
    const debt = await DebtReminder(remind).save(options);
    let content = `${sender.full_name} vừa gửi nhắc nợ với số tiền ${amount} tới cho bạn vào ${day}. ${description ? 'với nội dung ' + description : ""}`;
    let notify = {
      user_id: receiver.user_id,
      content: content,
      type: 'REMINDER',
      create_at: moment().unix(),
      is_hide: false,
      is_seen: false
    }
    await Notification(notify).save(options);
    await session.commitTransaction();
    session.endSession();
    return {
      success: true,
      debt,
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.status) throw error;
    throw createError(500, 'Server Error', error);
  }
}

const cancelReminder = async (reminder_id, description) => {
  const session = await DebtReminder.startSession();
  session.startTransaction();
  try {
    const options = {session};
    const debt = await DebtReminder.findByIdAndUpdate(reminder_id, {is_cancel: true});
    if (!debt) {
      throw createError(404, 'Can not find reminder');
    }
    const user = await User.findById(debt.receiver_id);
    if (!user) {
      throw createError(404, 'Can not find Debtor');
    }

    let content = `${user.full_name} vừa hủy nhắc nợ với số tiền ${debt.amount} bạn gửi vào ${debt.day}.Ghi chú: ${description}.`;

    let notify = {
      user_id: debt.sender_id,
      content,
      type: 'CANCEL_REMINDER',
      create_at: moment().unix(),
      is_hide: false,
      is_seen: false
    }

    await Notification(notify).save(options);
    await session.commitTransaction();
    session.endSession();
    return {
      success: true,
      debt
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

const deleteReminder = async (reminder_id) => {
  try {
    let reminder = await DebtReminder.findById(reminder_id);
    if (!reminder) {
      throw createError(404, 'Can not find reminder');
    }
    if (!reminder.is_done || !reminder.is_cancel) {
      await DebtReminder.findByIdAndDelete(reminder_id);
      return {
        ok: true
      }
    }
    throw createError(400, 'Can not delete this reminder');
  } catch (error) {
    throw error;
  }
}

const getAllReceiverOfUser = async user_id => {
  try {
    return await ReceiverList.find({user_id});
  } catch (error) {
    throw createError[500];
  }
}

const getReceiverById = async receiver_id => {
  try {
    let receiver = await ReceiverList.findById({_id: receiver_id});
    if (!receiver) {
      throw createError[404];
    }
    return receiver;
  } catch (error) {
    if (error.status)
      throw error;
    throw createError[500];
  }
}

const updateReceiver = async (receiver_id, new_name) => {
  try {
    let update = await ReceiverList.findByIdAndUpdate(receiver_id, {name: new_name}, {new: true});
    return update;
  } catch (error) {
    throw createError[404];
  }
}

const deleteReceiver = async receiver_id => {
  let session;
  try {
    session = await ReceiverList.startSession();
    session.startTransaction();
    const options = {session};
    const delReceiver = await ReceiverList.findOneAndDelete({_id: receiver_id}, options);
    if (delReceiver._id) {
      let updateUser = await User.findByIdAndUpdate(delReceiver.user_id, {$pull: {receivers: receiver_id}}, options);
      await session.commitTransaction();
      session.endSession();
      return {
        user_id: updateUser._id,
        delete_receiver_id: delReceiver._id,
        delete_receiver: delReceiver.name,
      }
    } else {
      throw createError[422];
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw createError[500];
  }
}

const createInnerReceiver = async (user_id, receiver_account, name) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    console.log(receiver_account)
    const options = {session};
    let account = await Account.findOne({account_number: receiver_account, account_type: 'deposit'});
    if (!account) {
      throw createError(404, 'Account not found');
    }
    let receiver_info = await User.findById(account.user_id, null);
    if (!receiver_info) {
      throw createError(404, 'User not found');
    }
    let reminder_name = name ? name : receiver_info.full_name;
    let save_receiver = {
      name: reminder_name,
      user_id,
      account_number: receiver_account,
    }
    const receiver = await ReceiverList(save_receiver).save(options);
    await User.findByIdAndUpdate(user_id, {$push: {receiver_list: receiver._id}}, options);
    await session.commitTransaction();
    session.endSession();
    return receiver;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error)
    if (error.status) throw error;
    throw createError(500, 'Server Error');
  }
}

const getUserInfoByAccountNumber = async account_number => {
  try {
    let account = await Account.findOne({account_number, account_type: 'deposit'});
    let user = await User.findById(account.user_id);
    if (!user) {
      throw createError[404];
    }
    return {
      user_name: user.user_name,
      email: user.email,
      user_id: user._id,
      full_name: user.full_name
    }
  } catch (error) {
    if (error.status) throw error;
    throw createError[500];
  }
}

const getAllBankName = async _ => {
  try {
    let banks = await Bank.find({});
    return banks.map(item => ({
      _id: item._id,
      bank_name: item.bank_name,
    }));
  } catch (error) {
    throw createError(500, error);
  }
}

const changePassword = async (user_id, old, newPassword) => {
  try {
    let user = await User.findById(user_id);
    if (!user) throw createError(404, 'can not find user');

    if (!bcrypt.compareSync(old, user.password)) {
      throw createError(400, 'Password is not correct');
    }

    const newpassword = bcrypt.hashSync(newPassword, 8);

    await User.findByIdAndUpdate(user_id, {password: newpassword});
    return {
      success: true
    }

  } catch (error) {
    throw error;
  }
}

// TODO: createOuterReceiver

module.exports = {
  getAllAccount,
  getOneAccountByAccountNumber,
  createSaveAccount,
  deleteAccount,
  changeAccountName,
  getAllDebtReminder,
  createDebtReminder,
  cancelReminder,
  deleteReminder,
  getAllReceiverOfUser,
  getReceiverById,
  updateReceiver,
  deleteReceiver,
  createInnerReceiver,
  getUserInfoByAccountNumber,
  getAllBankName,
  changePassword,
}
