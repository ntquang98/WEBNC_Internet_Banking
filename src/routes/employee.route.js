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

module.exports = router;