const bcrypt = require('bcryptjs');
const User = require('../models/schema/user');
const createError = require('http-errors');

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

module.exports = {
  createEmployee,
  createAdmin,
}