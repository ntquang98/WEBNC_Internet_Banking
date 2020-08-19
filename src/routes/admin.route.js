const route = require('express').Router();
const validate = require('../middlewares/validation.middleware');
const validateRequest = require('../middlewares/validateRequest.middleware');
const adminController = require('../controllers/admin.controller');

route.post(
  '/employees',
  validate('create_user'),
  validateRequest,
  adminController.createEmployee
);

route.post(
  '/admins',
  validate('create_user'),
  validateRequest,
  adminController.createAdmin
);

route.post(
  '/customers',
  validate('create_customer'),
  validateRequest,
  adminController.createCustomer
);

route.get('/admins', adminController.getAllAdmin);
route.get('/employees', adminController.getAllEmployee);
route.get('/customers', adminController.getAllCustomer);
route.get('/users', adminController.getAllUser);

route.delete('/employees/:user_id', adminController.deleteEmployee);
route.delete('/customers/:user_id', adminController.deleteCustomer);

route.get('/partners/:partner', adminController.getOnePartner);

route.get('/all_partner',
  adminController.getAllPartner
)

module.exports = route;
