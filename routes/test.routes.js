const { encrypt } = require('../utils/security');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const { find } = require('../models/linked_bank.model');
const request = require('supertest');
const axios = require('axios');
const express = require('express');
const router = express.Router();

router.get('/account', (req, res) => {
    let data = { account_number: req.body.data.account_number };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    axios({
        method: 'get',
        url: '/api/v1/linked/account',
        baseURL: 'https://s2q-ibanking.herokuapp.com',
        headers: { timestamp, security_key },
        data: {
            data,
            hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex')
        }
    }).then(function (response) {
        console.log("RESPONSE: ", response);
        res.send(response);
    }).catch(err => res.send(err));
});

router.post('/account', (req, res) => {
    let data = { 
        account_number: req.body.data.account_number,
        amount: req.body.data.amount
     };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    axios({
        method: 'post',
        url: '/api/v1/linked/account',
        baseURL: 'https://s2q-ibanking.herokuapp.com',
        headers: { timestamp, security_key },
        data: {
            data,
            hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex')
        }
    }).then(function (response) {
        console.log("RESPONSE: ", response);
        res.send(response);
    }).catch(err => res.send(err));
});

module.exports = router;