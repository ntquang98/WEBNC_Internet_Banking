const { encrypt } = require('../../utils/security');
const moment = require('moment');
const crypto = require('crypto');
const { find } = require('../../models/linked_bank.model');
const axios = require('axios');
const express = require('express');
const router = express.Router();

router.get('/account', (req, res) => {
    let data = { account_number: req.body.data.account_number };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);
    return axios({
        method: 'get',
        url: '/api/v1/linked/account',
        baseURL: 'https://s2q-ibanking.herokuapp.com',
        headers: { timestamp, security_key },
        data: {
            data,
            hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex')
        }
    }).then(function (response) {
        res.send(response.data);
    }).catch(err => res.send(err));
});

router.post('/account', async (req, res) => {
    let data = {
        account_number: req.body.data.account_number,
        amount: req.body.data.amount
    };
    let timestamp = moment().unix();
    let security_key = "test1";
    let _data = JSON.stringify(data, null, 2);

    // lấy private key RSA để ký, mấy bạn làm theo cách của mấy bạn
    let bank = await find({ security_key });
    let { private_key } = bank.attribute_data[0];
    private_key = private_key.replace(/\\n/g, '\n');

    try {
        let result = await axios({
            method: 'post',
            url: '/api/v1/linked/account',
            baseURL: 'https://s2q-ibanking.herokuapp.com',
            headers: { timestamp, security_key },
            data: {
                data,
                hash: crypto.createHash('sha256').update(timestamp + _data + security_key).digest('hex')
            }
        });
        console.log(result);
        res.send(result.data);
    } catch (err) {
        res.send(err);
    }
});

module.exports = router;