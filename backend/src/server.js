const app = require('./app');
const { port, host } = require('./config');

app.listen(port, host, () => {
  console.log(`Backend service running at http://${host}:${port}`);
});
