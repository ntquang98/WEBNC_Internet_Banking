const employeeService = require('../services/employee.service');

const createCustomer = async (req, res, next) => {
  try {
    let result = await employeeService.createCustomer(req.body);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCustomer,
}