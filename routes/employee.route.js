const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const { validate } = require('../middlewares/validation.middleware');
const { validationResult } = require('express-validator');

const CustomerController = require('../controllers/customer.controller')

router.post('/customers', validate('create_customer'), async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).send({ errors: errors });
      return;
    }
    let user = req.body;
    user.password = bcrypt.hashSync(req.body.password, 8);
    let ret = await CustomerController.create_customer(user);
    res.status(200).send(ret);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;