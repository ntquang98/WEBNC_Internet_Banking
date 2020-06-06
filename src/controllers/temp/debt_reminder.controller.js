const db = require('../../utils/db');
const DebtReminder = require('../../models/schema/debt_reminder');
const Notification = require('../../models/schema/notification');
const User = require('../../models/schema/user');
const moment = require('moment');
module.exports = {
  getAllDebtReminder: async user_id => {
    try {
      let debt = await db.find({ model: DebtReminder, data: { receiver_id: user_id } });
      let rent = await db.find({ model: DebtReminder, data: { sender_id: user_id } });
      return {
        debt: debt.attribute_data,
        rent: rent.attribute_data
      }
    } catch (error) {
      throw error;
    }
  },
  createDebtReminder: async reminder => {
    let { sender_id, receiver_id, amount, day, description } = reminder;
    const session = await DebtReminder.startSession();
    session.startTransaction();

    try {
      const options = { session };
      const debt = await DebtReminder(reminder).save(options);
      const sender = await User.findById(sender_id);
      let content = `${sender.full_name} vừa gửi nhắc nợ với số tiền ${amount} tới cho bạn vào ${day}. ${description ? 'với nội dung' + description : ""}`;
      let notify = {
        user_id: receiver_id,
        content: content,
        type: 'REMINDER',
        create_at: moment().unix(),
        is_hide: false,
        is_seen: false
      }
      const notification = await Notification(notify).save(options);
      return {
        success: true,
        debt
      }
    } catch (error) {
      throw error;
    }
  },
  deleteReminder: async reminder_id => {
    const session = await DebtReminder.startSession();
    session.startTransaction();
    try {
      const options = { session, new: true };
      const debt = await DebtReminder.findByIdAndUpdate(reminder_id, { is_cancel: true });
      const user = await User.findById(debt.receiver_id);
      let content = `${user.full_name} vừa hủy nhắc nợ với số tiền ${debt.amount} bạn gửi vào ${debt.day}.`
      let notify = {
        user_id: debt.sender_id,
        content,
        type: 'CANCEL_REMINDER',
        create_at: moment().unix(),
        is_hide: false,
        is_seen: false
      }
      const notification = await Notification(notify).save(options);
      return {
        success: true,
        debt
      }
    } catch (error) {
      throw error;
    }
  }
}