const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validation.middleware');
const validateRequest = require('../middlewares/validateRequest.middleware');
const employeeController = require('../controllers/employee.controller');

router.post('/customers',
  validate('create_customer'),
  validateRequest,
  employeeController.createCustomer
);

router.get('/customers',
  employeeController.getUserInfo
);

router.get('/accounts/histories/:account_number',
  employeeController.getAccountTransactionHistories
);

router.post('/accounts/:account_number',
  employeeController.sendMoney
)

module.exports = router;