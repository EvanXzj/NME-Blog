'use strict'

const http = require('http'),
      port = 3000,
      hostName = '127.0.0.1'

const server = http.createServer((req,res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
})

server.listen(port,hostName,() => {
    console.log(`Server runing at http://${hostName}:${port}`)
})