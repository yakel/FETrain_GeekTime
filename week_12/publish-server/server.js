const http = require('http')

http
  .createServer(function (request, response) {
    console.log(request)
    response.end('success')
  })
  .listen(3000)
