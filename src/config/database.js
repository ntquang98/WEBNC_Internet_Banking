const mongoose = require('mongoose');

class ConnectDatabase {
  constructor() {
    const url = process.env.NODE_ENV === 'test' ? process.env.Mongo_URI_TEST : process.env.Mongo_URI;
    mongoose.Promise = global.Promise;
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useUnifiedTopology', true);
    mongoose.set('useFindAndModify', false);
    mongoose.connect(url);
  }
}

export default new ConnectDatabase();