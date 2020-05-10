const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

require('express-async-errors');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.status(200).json({message: "Hello Hooman!!!"});
});

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
