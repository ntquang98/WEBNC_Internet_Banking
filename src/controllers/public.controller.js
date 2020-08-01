const customerService = require('../services/customer.service');
const transactionService = require('../services/transaction.service');

const sendUserInfo = async (req, res, next) => {
  try {
    let account_number = req.params.account_number;
    let result = await customerService.getUserInfoByAccountNumber(account_number);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

const handleRequestFromPartner = async (req, res, next) => {
  try {
    let transaction = {
      src_acc: req.body.data.source_account,
      des_acc: req.body.data.destination_account,
      src_bank: req.body.data.source_bank,
      des_bank: 'S2Q Bank',
      type: 'TRANSFER',
      description: req.body.data.description,
      feePayBySender: req.body.data.feePayBySender,
      fee: req.body.data.fee,
      amount: req.body.data.amount
    }
    let ret = await transactionService.handlePartnerRequest(req.headers, req.body.data, req.body.signature, transaction);
    res.status(200).send(ret);
  } catch (error) {
    next(error);
  }
}

const validateRequestFromPartner = (req, res, next) => {
  const {data} = req.body;
  const {source_account, destination_account, source_bank, description, feePayBySender, fee, amount} = data;
  if (!source_account) return res.status(400).send({message: 'missing source_account'});
  if (!destination_account) return res.status(400).send({message: 'missing destination_account'});
  if (!source_bank) return res.status(400).send({message: 'missing source_bank'});
  if (!description) return res.status(400).send({message: 'missing description'});
  if (feePayBySender == undefined) return res.status(400).send({message: 'missing is fee pay by sender'});
  if (!fee) return res.status(400).send({message: 'missing fee for transaction'});
  if (!amount) return res.status(400).send({message: 'missing amount of money for transaction'})
  next();
}

module.exports = {
  sendUserInfo,
  handleRequestFromPartner,
  validateRequestFromPartner
}
