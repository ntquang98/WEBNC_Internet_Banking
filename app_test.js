const express = require('express');
let mongoose = require('mongoose');
require('dotenv').config()
require('express-async-errors');
const app = express();
app.use(express.json());
let uri;
uri = process.env.Mongo_URI_TEST;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(data => {
    // do not thing
  })
  .catch(err => {
    throw err;
  });

app.get('/', (req, res) => {
  res.status(200).json({ message: "Hello Hooman!!!" });
});

app.use(`/api/v1/linked`, require('./routes/linked_bank.route'));

app.use((req, res, next) => {
  res.status(404).send('Not found');
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).send({ "message": err.message });
});

const disconnect = async () => {
  await mongoose.disconnect();
}

module.exports = { app, disconnect };
