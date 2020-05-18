const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
var mongoose = require('mongoose');
require('express-async-errors');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

var uri = process.env.Mongo_URI || "mongodb://admin:admin123@banktranfer-shard-00-00-vl6zg.mongodb.net:27017,banktranfer-shard-00-01-vl6zg.mongodb.net:27017,banktranfer-shard-00-02-vl6zg.mongodb.net:27017/bank?ssl=true&replicaSet=BankTranfer-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(data=>{
  console.log("database connected")
})
.catch(err=>{
  console.log("database connection failed")
});

app.get('/', (req, res) => {
  res.status(200).json({message: "Hello Hooman!!!"});
});

app.use(`/user`, require('./routes/api_route'));
app.use(`/taikhoan`, require('./routes/api_route'));
app.use(`/tranfer_history`, require('./routes/api_route'));

app.use((req, res, next) => {
  res.status(404).send('Not found');
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  const statusCode = err.status || 500;
  res.status(500).send('View error log on console');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, _ => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
