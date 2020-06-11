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

module.exports = route;