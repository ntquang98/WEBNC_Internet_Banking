import { logger } from '../utils/mail';

const mongoose = require('mongoose');

class ConnectDatabase {
  constructor() {
    const url = process.env.NODE_ENV === 'test' ? process.env.Mongo_URI_TEST : process.env.Mongo_URI;
    mongoose.Promise = global.Promise;
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useUnifiedTopology', true);
    mongoose.set('useFindAndModify', false);
    mongoose.connect(url, (error) => {
      if (error) {
        console.error('Mongodb connection error: ' + error);
      } else {
        console.log('mongodb connected')
      }
    });
  }
}

export default new ConnectDatabase();