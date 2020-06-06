const express = require("express");
const router = express.Router();

const customerController = require('../controllers/customer.controller');
const validate = require('../middlewares/validation.middleware');
const validateRequest = require('../middlewares/validateRequest.middleware');

router.get(
  '/accounts',
  customerController.getAllAccount
);

router.get(
  '/accounts/:account_number',
  customerController.getOneAccountByAccountNumber
);

router.post(
  '/accounts',
  validate('createAccount'),
  validateRequest,
  customerController.createSaveAccount
);

router.delete(
  '/accounts/:account_number',
  customerController.deleteAccount
);

router.put(
  '/accounts/:account_number',
  validate('changeAccount'),
  validateRequest,
  customerController.changeAccountName
);

router.post('/receivers',
  validate('createReceiver'),
  validateRequest,
  customerController.createReceiver
);

router.get('/receivers',
  customerController.getAllReceiverOfUser
);

router.get('/receivers/:receiver_id',
  customerController.getReceiverById
);

router.put('/receivers/:receiver_id',
  customerController.updateReceiver
);

router.delete('/receivers/:receiver_id',
  customerController.deleteReceiver
);

router.get('/debt_lists',
  customerController.getAllDebtReminder
);

router.post('/debt_lists',
  validate('create_debt'),
  validateRequest,
  customerController.createDebtReminder
);

router.put('/debt_lists/:receiver_id',
  customerController.deleteDebtReminder
);

router.get('/customers/:account_number',
  customerController.getUserInfoByAccountNumber
)

module.exports = router;