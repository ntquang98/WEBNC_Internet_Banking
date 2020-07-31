const adminService = require('../services/admin.service');

const createEmployee = async (req, res, next) => {
  try {
    let result = await adminService.createEmployee(req.body);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

const createAdmin = async (req, res, next) => {
  try {
    let result = await adminService.createAdmin(req.body);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

const createCustomer = async (req, res, next) => {
  try {
    let user = await adminService.createCustomer(req.body);
    res.status(201).send(user);
  } catch (error) {
    next(error);
  }
}

const getAllCustomer = async (req, res, next) => {
  try {
    let users = await adminService.getAllCustomer();
    res.status(200).send(users);
  } catch (error) {
    next(error);
  }
}

const deleteCustomer = async (req, res, next) => {
  try {
    let {user_id} = req.params;
    let result = await adminService.deleteCustomer(user_id);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

const getAllEmployee = async (req, res, next) => {
  try {
    let employees = await adminService.getAllEmployee();
    res.status(200).send(employees);
  } catch (error) {
    next(error);
  }
}

const deleteEmployee = async (req, res, next) => {
  try {
    let {user_id} = req.params;
    let ret = await adminService.deleteEmployee(user_id);
    res.status(200).send(ret);
  } catch (error) {
    next(error);
  }
}

const getAllAdmin = async (req, res, next) => {
  try {
    let ret = await adminService.getAllAdmin();
    res.status(200).send(ret);
  } catch (error) {
    next(error);
  }
}

const getAllUser = async (req, res, next) => {
  try {
    let ret = await adminService.getAllUser();
    res.status(200).send(ret);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAdmin,
  createEmployee,
  createCustomer,
  getAllAdmin,
  getAllCustomer,
  getAllEmployee,
  deleteCustomer,
  deleteEmployee,
  getAllUser,
}
