module.exports = {
  createSaveNotification: (userId, amount, accountName) => ({
    user_id: userId,
    type: 'SAVING',
    content: `Tài khoản của bạn vừa giảm ${amount},Nội dung: chuyển vào tài khoản tiết kiệm ${accountName}.`
  }),
  createWithDrawNotification: (userId, amount, accountName) => ({
    user_id: userId,
    type: 'WITHDRAW',
    content: `Tài khoản của bạn vừa tăng ${amount}, Nội dung: rút từ tài khoản tiết kiệm ${accountName}.`
  }),
  createPayDebtNotification: (userId, amount, ownerName, ownerAccount) => ({
    user_id: userId,
    type: 'PAY_DEBT',
    content: `Tài khoản của bạn vừa giảm ${amount}. Nội dung: Thanh toán nợ cho ${ownerName}, số tài khoản ${ownerAccount}.`
  }),
  createGetDebtNotification: (userId, amount, debtorName, debtorAccount) => ({
    user_id: userId,
    type: 'GET_DEBT',
    content: `Tài khoản của bạn vừa tăng ${amount}. Nội dung: Thanh toán nợ từ ${debtorName}, số tài khoản ${debtorAccount}`
  }),
  createReceiveMoneyNotification: (userId, amount, balance, description = '') => {
    let date = new Date()
    return {
      user_id: userId,
      type: 'RECEIVER_MONEY',
      content: `Tài khoản của bạn vừa tăng ${amount} vào lúc ${date.toLocaleDateString('vi-VN')}, số dư hiện tại ${balance}. Nội dung: ${description}.`
    }
  },
  createSendMoneyNotification: (userId, amount, balance, description = '') => ({
    user_id: userId,
    type: 'SEND_MONEY',
    content: `Tài khoản của bạn vừa giảm ${amount} vào lúc ${(new Date).toLocaleDateString('vi-VN')}, số dư hiện tại ${balance}. Nội dung: ${description}.`
  }),
  createReceiveDebtNotification: (userId, amount, sender, description = '') => ({
    user_id: userId,
    type: 'REMINDER',
    content: `${sender} vừa gửi nhắc nợ với số tiền ${amount}. Với nội dung: ${description}`
  }),
  createDebtCanceledNotification: (userId, amount, receiver, day, description) => ({
    user_id: userId,
    type: 'CANCEL_REMINDER',
    content: `${receiver} vừa hủy nhắc nợ với số tiền ${amount} bạn gửi vào ngày ${(new Date(day)).toLocaleDateString('vi-VN')}. Nội dung: ${description}`
  })
}
