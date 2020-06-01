const { body } = require('express-validator');

exports.validate = (method) => {
  switch (method) {
    case 'create_customer': {
      return [
        body('user_name', 'user_name bị thiếu').exists(),
        body('password')
          .isLength({ min: 5 }).withMessage('password phải dài ít nhất 5 kí tự').exists().withMessage('password bị thiếu'),
        body('full_name').exists().withMessage('full_name bị thiếu'),
        body('email').isEmail().withMessage('email không đúng định dạng'),
        body('phone').exists().withMessage('thiếu số điện thoại')
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
  }
}