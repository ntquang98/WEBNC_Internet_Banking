const express = require('express');
const api_query = require('../models/api_query');
const router = express.Router();


router.post('/', async (req, res) => {
  var data = req.body.attribute_query;
  var result = await api_query.query({ data: data[0] })
  if (result.success == false) {
    res.json(result).status(400);
    return;
  }
  res.json(result)
})

router.post('/transfer', async (req, res) => {
  var data_body = req.body.attribute_query;
  var data_header = req.headers;
  var result = await api_query.transfer({ data: data_body[0] })

  if (result.success == true) {
    //Save to somewhere infomation like: user, account, security, ...
  }

  if (result.success == false) {
    res.json(result).status(400);
    return;
  }
  res.json(result)
})

module.exports = router;