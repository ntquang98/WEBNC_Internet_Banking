const router = require('express').Router();
const validate = require('../middlewares/validation.middleware');
const validateRequest = require('../middlewares/validateRequest.middleware');
const transactionController = require('../controllers/transaction.controller');

router.post('/transfer',
  validate('makeTransaction'),
  validateRequest,
  transactionController.makeTransaction
);

router.post('/pay_debt',
  validate('makeTransaction'),
  transactionController.payDebt
);

router.get('/request',
  transactionController.requestTransaction
);

router.get('/histories/:account_number',
  transactionController.getHistory
);

module.exports = router;