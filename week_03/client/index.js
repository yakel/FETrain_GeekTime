const images = request('images')
const Request = require('./Request')
const parser = require('./parser')
const render = request('./render')

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
  let viewport = images(800, 600)
  render(viewport, dom)
  viewport.save('viewport.jpg')
})
