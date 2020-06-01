const route = require('express').Router();
const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const { validate } = require('../middlewares/validation.middleware');
const { validationResult } = require('express-validator');

const UserController = require('../controllers/user.controller');

route.post('/create_employee', validate('create_user'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ errors });
      return;
    }
    let user = req.body;
    user.password = bcrypt.hashSync(req.body.password, 8);
    user.user_role = "employee";

    let emp = await UserController.create_user(user);

    return res.status(200).send({
      success: true,
      user_id: emp._id,
      user_name: emp.user_name,
    });
  } catch (error) {
    throw createError(500, error);
  }
});

route.post('/create_admin', validate('create_user'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).send({ errors });
    return;
  }

  let employee = {
    user_name: req.body.user_name,
    password: bcrypt.hashSync(req.body.password, 8),
    user_role: "admin"
  };
  try {
    let emp = await UserController.create_user(employee);
    return res.status(200).send({
      success: true,
      user_id: emp._id,
      user_name: emp.user_name,
    });

  } catch (error) {
    throw createError(500, error);
  }
});

module.exports = route;