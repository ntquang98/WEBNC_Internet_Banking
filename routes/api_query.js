const express = require('express');
const api_query = require('../models/api_query');
const router = express.Router();


router.post('/', async (req, res) => {
    var data = req.body.attribute_query;
    var result = await api_query.query({data: data[0]})
    if(result.success==false){
        res.json(result).status(400);
        return;
      }
    res.json(result)
})



module.exports = router;