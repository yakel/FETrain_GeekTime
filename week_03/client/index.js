const Request = require('./Request')
const parser = require('./parser')

const request = new Request({
  method: 'POST',
  host: 'localhost',
  port: 8080,
  path: '/',
  headers: {
    ['X-Foo2']: 'customed',
  },
  body: {
    name: 'yakel',
  },
})

request.send().then((response) => {
  let dom = parser.parseHTML(response.body)
})
