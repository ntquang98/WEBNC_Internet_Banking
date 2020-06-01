const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
let mongoose = require('mongoose');
require('dotenv').config()
require('express-async-errors');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

let uri;
if (process.env.NODE_ENV === 'test') {
  uri = process.env.Mongo_URI_TEST;
} else {
  uri = process.env.Mongo_URI || "mongodb://admin:admin123@banktranfer-shard-00-00-vl6zg.mongodb.net:27017,banktranfer-shard-00-01-vl6zg.mongodb.net:27017,banktranfer-shard-00-02-vl6zg.mongodb.net:27017/bank?ssl=true&replicaSet=BankTranfer-shard-0&authSource=admin&retryWrites=true&w=majority";
}
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(data => {
    console.log("database connected")
  })
  .catch(err => {
    console.log("database connection failed")
  });

const verifyAuth = require('./middlewares/auth.middleware');

app.get('/', (req, res) => {
  res.status(200).json({ message: "Hello Hooman!!!" });
});

app.use(`/api/v1/linked`, require('./routes/linked_bank.route'));

app.use(`/user`, require('./routes/api_route'));
app.use(`/account`, require('./routes/api_route'));
app.use(`/tranfer_history`, require('./routes/api_route'));
app.use(`/query`, require('./routes/api_query'))
app.use(`/test`, require('./routes/test.routes'));

app.use('/auth', require('./routes/auth.route'));
app.use('/employee', require('./routes/employee.route'));
app.use('/customer', require('./routes/customer.route'));
app.use('/admin', require('./routes/admin.route'));


app.use((req, res, next) => {
  res.status(404).send('Not found');
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).send(err.message);
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "http://localhost"
app.listen(PORT, _ => {
  console.log(`Server is running at ${HOST}:${PORT}/`);
});