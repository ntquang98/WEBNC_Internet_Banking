const employeeService = require('../services/employee.service');

const createCustomer = async (req, res, next) => {
  try {
    let result = await employeeService.createCustomer(req.body);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
}

const sendMoney = async (req, res, next) => {
  try {
    let { account_number } = req.params;
    let amount = req.body.amount;
    let ret = await employeeService.sendMoneyToCustomerAccount(account_number, amount);
    res.status(200).send(ret);
  } catch (error) {
    next(error);
  }
}

const getUserInfo = async (req, res, next) => {
  let { email } = req.query;
  try {
    let ret = await employeeService.getUserInformation(email);
    res.status(200).send(ret);
  } catch (error) {
    next(error);
  }
}

const getAccountTransactionHistories = async (req, res, next) => {
  let { account_number } = req.params;
  try {
    let ret = await employeeService.getAccountTransactionHistories(account_number);
    res.status(200).send(ret);
  } catch (error) {
    next(error);
  }

}

module.exports = {
  createCustomer,
  sendMoney,
  getUserInfo,
  getAccountTransactionHistories
}