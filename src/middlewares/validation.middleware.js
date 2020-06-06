const { body } = require('express-validator');

module.exports = (method) => {
  switch (method) {
    case 'create_customer': {
      return [
        body('user_name', 'user_name bị thiếu').exists(),
        body('password')
          .isLength({ min: 5 }).withMessage('password phải dài ít nhất 5 kí tự').exists().withMessage('password bị thiếu'),
        body('full_name').exists().withMessage('full_name bị thiếu'),
        body('email').isEmail().withMessage('email không đúng định dạng'),
        body('phone').exists().withMessage('thiếu số điện thoại'),
      ];
    }
    case 'login': {
      return [
        body('user_name', 'user_name bị thiếu').exists(),
        body('password')
          .isLength({ min: 5 }).withMessage('password phải dài ít nhất 5 kí tự')
          .exists().withMessage('password bị thiếu')
      ]
    }
    case 'create_user': {
      return [
        body('user_name', 'user_name is missing').exists(),
        body('password').isLength({ min: 5 }).withMessage('password phải dài ít nhất 5 kí tự')
      ];
    }
    case 'create_debt': {
      return [
        body('account_number').exists(),
        body('sender_id').exists(),
        body('receiver_id').exists(),
        body('amount').exists()
      ]
    }
    case 'createAccount':
      return [
        body('account_name').exists()
      ]
    case 'changeAccount':
      return [
        body('account_name').exists()
      ]
    case 'createReceiver':
      return [
        body('name').exists(),
        body('account_number').exists(),
        body('bank').exists(),
      ]
    case 'resetPassword':
      return [
        body('email').exists(),
        body('OTP').exists(),
        body('password').exists().isLength({ min: 5 })
      ]
  }
}