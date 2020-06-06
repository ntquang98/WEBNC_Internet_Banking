const mongoose = require('mongoose');
const db = require('../../utils/db');
const User = require('../../models/schema/user');

module.exports = {
  create_user: async (new_user) => {
    // use for create employee and admin
    try {
      const user = await User(new_user).save();
      if (user) {
        return user;
      } else {
        throw new Error("Can not create user");
      }
    } catch (error) {
      throw error;
    }
  }
}