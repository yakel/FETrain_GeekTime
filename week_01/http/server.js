const http = require('http')

const port = 8088

http
  .createServer((request, response) => {
    let body = []
    request
      .on('error', (err) => {
        console.error(err)
      })
      .on('data', (chunk) => {
        body.push(chunk)
      })
      .on('end', () => {
        body = Buffer.concat(body).toString()
        console.log('body:', body)
        response.writeHead(200, { 'Content-Type': 'text/html' })
        response.end('Hello World\n')
      })
  })
  .listen(port)

console.log('server started, listening', port)
