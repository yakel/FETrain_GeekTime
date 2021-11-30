const http = require('http')
const fs = require('fs')

const request = http.request(
  {
    hostname: '127.0.0.1',
    port: 3000,
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  },
  (response) => {
    console.log('response:', response)
  }
)

const file = fs.createReadStream('./sample.html')

file.on('data', (chunk) => {
  request.write(chunk)
  console.log(chunk.toString())
})

file.on('end', (chunk) => {
  request.end(chunk)
})
