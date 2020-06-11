const bcrypt = require('bcryptjs');
const User = require('../models/schema/user');
const Account = require('../models/schema/account');
const createError = require('http-errors');

const employeeService = require('./employee.service');

const createEmployee = async user => {
  try {
    user.password = bcrypt.hashSync(user.password, 8);
    user.user_role = 'employee';
    let employee = await User(user).save();
    return {
      success: true,
      user_id: employee._id,
      user_name: employee.user_name,
    }
  } catch (error) {
    throw createError[500];
  }
}

const createAdmin = async user => {
  try {
    user.password = bcrypt.hashSync(user.password, 8);
    user.user_role = 'admin';
    let admin = await User(user).save();
    return {
      success: true,
      user_id: admin._id,
      user_name: admin.user_name,
    };
  } catch (error) {
    throw createError[500];
  }
}

const createCustomer = async newUser => {
  try {
    return await employeeService.createCustomer(newUser);
  } catch (error) {
    throw error;
  }
}

const getAllCustomer = async () => {
  try {
    let users = await User.find();
    return users;
  } catch (error) {
    throw createError(500, 'Server Error');
  }
}

const deleteCustomer = async user_id => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    let options = { session };
    let result = await User.findByIdAndDelete(user_id, options);
    await Account.remove({ _id: { $in: result.accounts } }, options);
    return {
      success: true
    }
  } catch (error) {
    throw createError(500, 'Server Error');
  }
}

module.exports = {
  createEmployee,
  createAdmin,
  createCustomer,
  getAllCustomer,
  deleteCustomer,
}