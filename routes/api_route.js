const express = require('express');
const api_model = require('../models/api_model');
const router = express.Router();

let model;
function get_path(path){
  const [,mod,callname] = path && path.split('/') || []
  model = mod;
  return;
}

router.post('/insert', async (req,res) =>{
  get_path(req.originalUrl)
  var attribute_data = req.body.attribute_insert || []
  if(attribute_data && attribute_data.length == 0){
    res.json({success: false, error_msgs: "request is empty"})
    return
  }else{
    
    var result = await api_model.insert({attribute_data:attribute_data,model:model })
    if(result.success==false){
      res.json(result).status(400);
      return;
    }
    res.json(result)
  }
})
router.post('/update', async (req,res) =>{
  get_path(req.originalUrl)
  var attribute_data = req.body.attribute_update || []
  if(attribute_data && attribute_data.length == 0){
    res.json({success: false, error_msgs: "request is empty"})
    return
  }else{

    var result = await api_model.update({attribute_data:attribute_data, model:model})
    if(result.success==false){
      res.json(result).status(400);
      return;
    }
    res.json(result)
  }
}),
router.get('/find', async(req, res)=>{
  get_path(req.originalUrl)
  var user = new Object()
  user = {
    ...user,
    user_name: req.query.user_name || '',
    password: req.query.password || '',
    email: req.query.email || '',
    dob: req.query.dob || '',
    sub_user: req.query.sub_user || '',
    user_role: req.query.user_role || '',
  }

  var result = await api_model.find({user:user, model:model})
  if(result.success==false){
    res.json(result).status(400);
    return;
  }
  res.json(result)
})
router.delete('/delete', async(req, res)=>{
  get_path(req.originalUrl)
  var query = new Object()
  query = req.query;

  var result = await api_model.delete({query:query, model:model})
  if(result.success==false){
    res.json(result).status(400);
    return;
  }
  res.json(result)
})


module.exports = router;