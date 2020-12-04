const http = require('http');
const app = require('./app');
// set port
const port = process.env.PORT || 3001;
// create server
const server = http.createServer(app);
console.log(`App started, listening on port:${port}`)
// start server
server.listen(port)