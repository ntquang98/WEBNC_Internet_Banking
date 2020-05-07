const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.status(200).json({message: "Hello Hooman!!!"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, _ => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
