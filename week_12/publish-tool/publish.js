const http = require('http')

const request = http.request(
  {
    hostname: '127.0.0.1',
    port: 3000,
    // headers: {
    //   'content-type': 'application/octea-stream',
    // },
  },
  (response) => {}
)

request.end()
