const db = require('../../utils/db');
const User = require('../../models/schema/user');
const ReceiverList = require('../../models/schema/receiver_list');

module.exports = {
  getAllReceiverOfUser: async user_id => {
    try {
      return await db.find({ model: ReceiverList, data: { user_id } });
    } catch (error) {
      throw error;
    }
  },
  getReceiverOfUserById: async (user_id, receiver_id) => {
    try {
      let receivers = await db.find({ model: ReceiverList, data: { user_id, _id: receiver_id } });
      if (receivers.attribute_data > 0) {
        return receivers.attribute_data[0];
      }
    } catch (error) {
      throw error;
    }
  },
  updateReceiver: async (user_id, receiver_id, new_receiver_name) => {
    try {
      let update = await ReceiverList.findOneAndUpdate({ _id: receiver_id, user_id }, { name: new_receiver_name }, { new: true });
      return update; // receiver after update
    } catch (error) {
      throw error;
    }
  },
  deleteReceiver: async (user_id, receiver_id) => {
    let session;
    try {
      session = await ReceiverList.startSession();
      session.startTransaction();
      const options = { session };
      const delReceiver = await ReceiverList.findOneAndDelete({ _id: receiver_id, user_id }, options);
      if (delReceiver._id) {
        let updateUser = await User.findByIdAndUpdate(user_id, { $pull: { receivers: receiver_id } }, options);
        await session.commitTransaction();
        session.endSession();
        return {
          user_id: updateUser._id,
          delete_receiver_id: delReceiver._id,
          delete_receiver: delReceiver.name,
        }
      } else {
        throw { success: false, error: { message: "Cannot delete receiver" } };
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },
  createInnerReceiver: async (user_id, receiver_account, name) => {
    const session = await User.startSession();
    session.startTransaction();
    try {
      const options = { session, new: true };
      let receiver_info = await User.findOne({ $in: { accounts: receiver_account } }, options);
      let reminder_name = name ? name : receiver_info.full_name;
      let save_receiver = {
        name: reminder_name,
        user_id,
        account_number: receiver_account,
      }
      const receiver = await ReceiverList(save_receiver).save(options);
      await User.findByIdAndUpdate(user_id, { $push: { receiver_list: receiver._id } }, options);
      await session.commitTransaction();
      session.endSession();
      return receiver;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}