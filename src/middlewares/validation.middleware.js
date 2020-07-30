const {body} = require('express-validator');

module.exports = (method) => {
  switch (method) {
    case 'create_customer': {
      return [
        body('full_name').exists().withMessage('full_name bị thiếu'),
        body('email').isEmail().withMessage('email không đúng định dạng'),
        body('phone').exists().withMessage('thiếu số điện thoại'),
      ];
    }
    case 'login': {
      return [
        body('user_name', 'user_name bị thiếu').exists(),
        body('password')
          .isLength({min: 5}).withMessage('password phải dài ít nhất 5 kí tự')
          .exists().withMessage('password bị thiếu')
      ]
    }
    case 'create_user': {
      return [
        body('email').isEmail('Email không đúng định dạng').exists('Email bị thiếu'),
        body('full_name', 'full_name is missing').exists(),
        body('password').isLength({min: 5}).withMessage('password phải dài ít nhất 5 kí tự')
      ];
    }
    case 'create_debt': {
      return [
        body('src_account_number').exists(),
        body('des_account_number').exists(),
        body('description').exists(),
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
        body('account_number').exists(),
        body('bank').exists(),
      ]
    case 'resetPassword':
      return [
        body('email').exists(),
        body('OTP').exists(),
        body('password').exists().isLength({min: 5})
      ]
    case 'makeTransaction':
      return [
        body('source_account').exists(),
        body('destination_account').exists(),
        body('source_bank').exists(),
        body('destination_bank').exists(),
        body('isFeePayBySender').exists(),
        body('fee').exists(),
        body('OTP').isLength({min: 6, max: 6}),
      ];
  }
}
