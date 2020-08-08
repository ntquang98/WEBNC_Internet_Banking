const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validation.middleware');
const validateRequest = require('../middlewares/validateRequest.middleware');


/* const adminService = require('../services/admin.service') */;
const adminController = require('../controllers/admin.controller');

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
);

router.post('/new_password',
  validate('resetPassword'),
  validateRequest,
  authController.resetPassword
);

/* router.post('/new_admin', (req, res) => {
  try {
    let admin = adminService.createAdmin(req.body);
    let ret = {
      success: true,
      user_id: admin._id,
      user_name: admin.user_name,
    };

    res.status(201).send(ret);
  } catch (error) {
    throw error;
  }
}); */

router.get('/all_partner',
  adminController.getAllPartner
)

router.get('/getOne/:partner',
  adminController.getOnePartner
)

module.exports = router;
