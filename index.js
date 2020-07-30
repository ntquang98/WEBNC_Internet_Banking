const app = require('./src/app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "http://localhost"
app.listen(PORT, _ => {
  console.log(`Server is running at ${HOST}:${PORT}/`);
});
