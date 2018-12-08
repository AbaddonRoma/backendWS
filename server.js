const http = require('http');
let app = require('./app');
let port = process.env.PORT || 3000;

let server = http.createServer(app);

server.listen(port, () => {
  console.log('Server is listening on port ', port);
});