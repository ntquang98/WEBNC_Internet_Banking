const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validation.middleware');
const validateRequest = require('../middlewares/validateRequest.middleware');

router.post('/login',
  validate('login'),
  validateRequest,
  authController.login
);

router.get('/refresh',
  authController.refresh
);

router.post('/reset_password',
  authController.forgotPasswordHandler
)
router.post('/new_password',
  validate('resetPassword'),
  validateRequest,
  authController.resetPassword
)

module.exports = router;
