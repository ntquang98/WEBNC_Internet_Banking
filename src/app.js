const compression = require('compression');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config()
require('express-async-errors');
// connect database
require('./config/database');

const app = express();
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

const verifyAuth = require('./middlewares/auth.middleware');

app.use('/', express.static(__dirname + '/public'));

//app.use(`/api/v1/linked`, require('./routes/linked_bank.route'));

app.use('/auth', require('./routes/auth.route'));
app.use('/employee', verifyAuth('employee'), require('./routes/employee.route'));
app.use('/customer', verifyAuth('customer'), require('./routes/customer.route'));
app.use('/admin', verifyAuth('admin'), require('./routes/admin.route'));
app.use('/transaction', verifyAuth('customer'), require('./routes/transaction.route'));
app.use('/public', require('./routes/public.route'));
//require('./tests/testabc');
app.use((req, res, next) => {
  res.status(404).send('Not found this route. Not Implemented');
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).send(err.message);
});

module.exports = app;
