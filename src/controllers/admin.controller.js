const adminService = require('../services/admin.service');

const createEmployee = async (req, res, next) => {
  try {
    let result = adminService.createEmployee(req.body);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

const createAdmin = async (req, res, next) => {
  try {
    let result = adminService.createAdmin(req.body);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAdmin,
  createEmployee,
}
