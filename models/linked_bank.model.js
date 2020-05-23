const db = require('../utils/db');
const Bank = require('../utils/bank');
const MyBank = require('../utils/my_bank');

module.exports = {
  insert: async (data) => {
    let result = await db.insert({ model: Bank, data });
    return result;
  },
  find: async (data) => {
    let result = await db.find({ model: Bank, data });
    return result;
  },
  findMyBank: async () => {
    let result = await db.find({ model: MyBank, data: { bank_name: "S2Q Bank" } });
    return result;
  }
}