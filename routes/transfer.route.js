const express = require('express');
const router = express.Router();
const model = require('../models/linked_bank.model');
const api_query = require('../models/api_query');
const createError = require('http-errors');
const moment = require('moment');
const axios = require('axios');

router.get('/partner', (req, res, next) => {
  /** TODO: Get account information of partner bank account
   * 1. Get account number and partner bank name from req
   * 2. Create timestamp
   * 3.1. Get Partner encrypt type -> maybe create a factory for create package purpose
   * 3.2. Get secret key, private key suit with that partner from MyBank db
   * 4. Create package
   * 5. Send and wait (using axios)
   * 6. Send result back to client
   */
  let { data } = req.body || {};
  let { account_number, partner_code } = data || {};
  let timestamp = moment().unix();
  // const instance = axios.create({
  //   baseURL: 'https://some-domain.com/api/',
  //   timeout: 1000,
  //   headers: { 'X-Custom-Header': 'foobar' }
  // });
});

router.post('/partner', (req, res, next) => {
  /** TODO: Send money to partner bank account
   * 1 -> 4: Do same like above
   * 5. Send and wait for result
   * 6. decrypt 
   * 7. If success -> subtract user account money
   * 7.1 If not -> error
   * 
   */

})

module.exports = router;