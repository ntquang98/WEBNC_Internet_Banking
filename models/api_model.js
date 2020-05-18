const db = require('../utils/db');
const User = require('../utils/user');
const Taikhoan = require('../utils/account');
const Tranfer_history = require('../utils/tranfer_history');

function getModel(model){
  let MODEL = User;
  switch(model){
    case 'user':{
      MODEL = User;
    }break;
    case 'taikhoan':{
      MODEL = Taikhoan;
    }break;
    case 'tranfer_history':{
      MODEL = Tranfer_history;
    }
  }

  return MODEL;
}
module.exports = {
    insert: async ({attribute_data: attribute_data, model:model})=>{
      var mod = getModel(model);

      let userModel = new mod(attribute_data);
      var insert_result = await db.insert({model: userModel, data: attribute_data});
      return insert_result;
    },

    find: async ({user:user,model:model})=>{
      var mod = getModel(model);

      var data = new Object();
      for(let [k,v] of Object.entries(user)){
        if(v!=''){
          data[k] = v
        }
      }
      var insert_result = await db.find({model: mod, data: data});
      return insert_result;
    },

    update: async({attribute_data: attribute_data, model:model})=>{
      var mod = getModel(model);

      var attribute_data_0 =  attribute_data && attribute_data[0]? attribute_data[0] : {}

      if(attribute_data_0.id && attribute_data_0.data){

        var updateOne_result = await db.updateOne({model: mod, data: attribute_data_0});
        return updateOne_result;

      }else if(!attribute_data_0.id && attribute_data_0.data_up && attribute_data_0.data_down){

        var updateMany_result = await db.updateMany({model: mod, data: attribute_data_0});
        return updateMany_result;
      }
      
    },

    delete: async({query:data,model:model})=>{
      var mod = getModel(model);
      console.log('mod',model)
      if(data && Object.keys(data)[0]){
        var deleteOne_result = await db.deleteOne({model: mod, data: data});
        return deleteOne_result;
      }else {
        var deleteMany_result = await db.deleteMany({model: mod, data: data});
        return deleteMany_result;
      }
      
    }

};