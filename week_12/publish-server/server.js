const http = require('http')
const fs = require('fs')

http
  .createServer(function (request, response) {
    console.log('headers:', request.headers)

    const file = fs.createWriteStream('../server/public/index.html')

    request.on('data', (chunk) => {
      console.log(chunk.toString())
      file.write(chunk)
    })
    request.on('end', (chunk) => {
      file.end(chunk)
      response.end('success')
    })
  })
  .listen(3000)
