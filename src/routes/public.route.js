// Chuyển logic từ lined_bank.route.js sang

const { slimCheck, fullCheck } = require('../middlewares/security.middleware');
const publicController = require('../controllers/public.controller');

const router = require('express').Router();

// TODO: lam client test request from partner
router.get('/:account_number',
  slimCheck,
  publicController.sendUserInfo
);

router.post('/transfer',
  fullCheck,
  publicController.validateRequestFromPartner,
  publicController.handleRequestFromPartner
);

module.exports = router;