const bcrypt = require('bcryptjs');
const User = require('../models/schema/user');
const Account = require('../models/schema/account');

const RequestLog = require('../models/schema/request_log');
const ResponseLog = require('../models/schema/response_log');
const PartnerRequestLog = require('../models/schema/partner_request_log');
const PartnerResponseLog = require('../models/schema/partner_response_log');

const createError = require('http-errors');

const employeeService = require('./employee.service');

const createCustomer = async newUser => {
  try {
    return await employeeService.createCustomer(newUser);
  } catch (error) {
    throw error;
  }
}

const getAllCustomer = async () => {
  try {
    let users = await User.find({user_role: 'customer'}).populate({
      path: 'accounts',
      select: ['account_number', 'amount']
    });
    return users;
  } catch (error) {
    console.log(error)
    throw createError(500, 'Server Error');
  }
}

const deleteCustomer = async user_id => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    let options = {session};
    let result = await User.findByIdAndDelete(user_id, options);
    await Account.remove({_id: {$in: result.accounts}}, options);
    return {
      success: true
    }
  } catch (error) {
    throw createError(500, 'Server Error');
  }
}

const createEmployee = async user => {
  try {
    let check = await User.findOne({user_name: user.user_name});
    if (check) {
      throw createError(400, 'Username is already used');
    }
    user.password = bcrypt.hashSync(user.password, 8);
    user.user_role = 'employee';
    let employee = await User(user).save();
    console.log(employee);
    return {
      success: true,
      user_id: employee._id,
      user_name: employee.user_name,
    }
  } catch (error) {
    if (error.status) throw error;
    throw createError[500];
  }
}

const getAllEmployee = async () => {
  try {
    let users = await User.find({user_role: 'employee'});
    return users;
  } catch (error) {
    throw createError(500, 'Server Error');
  }
}

const deleteEmployee = async user_id => {
  try {
    let deletedEmployee = await User.findByIdAndDelete(user_id);
    return {
      success: true,
      deleted: deletedEmployee
    }
  } catch (error) {
    throw createError(500, 'Server Error');
  }
}

const createAdmin = async user => {
  try {
    let check = await User.findOne({user_name: user.user_name});
    if (check) {
      throw createError(400, 'Username is already used');
    }
    user.password = bcrypt.hashSync(user.password, 8);
    user.user_role = 'admin';
    let admin = await User(user).save();
    return {
      success: true,
      user_id: admin._id,
      user_name: admin.user_name,
    };
  } catch (error) {
    if (error.status) throw error;
    throw createError(500, 'Server Error');
  }
}

const getAllAdmin = async _ => {
  try {
    let admins = await User.find({user_role: 'admin'});
    return admins;
  } catch (error) {
    throw error;
  }
}


// TODO: query thong tin ngan hang doi tac, doi xoat

const getAllPartner = async _ => {

}

const getOnePartner = async name => {

}


// xem lịch sử giao dịch với ngân hàng khác
/**
 * Mặc định là hiển thị giao dịch trong tháng
 * - Lấy ngày tháng hiện tại
 * - Query các giao dịch tháng trùng.
 * Chọn giao dịch theo tháng
 * - lấy ngày tháng được truyền tới.
 * - Query các giao dịch phù hợp
 * Trong khoản thời gian.
 * - filter giao dịch
 *
 * -> tạo các middleware filter cho dễ
 */


module.exports = {
  createEmployee,
  createAdmin,
  createCustomer,
  getAllCustomer,
  deleteCustomer,
  getAllEmployee,
  deleteEmployee,
  getAllAdmin
}
