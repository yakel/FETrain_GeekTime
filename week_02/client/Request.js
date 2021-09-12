const net = require('net')
const ResponseParser = require('./ResponseParser')

class Request {
  constructor(options) {
    this.method = options.method || 'GET'
    this.host = options.host
    this.port = options.port || 80
    this.path = options.path || '/'
    this.headers = options.headers || {}
    this.body = options.body || {}

    let contentType = this.headers['Content-Type']
    if (!contentType) {
      contentType = this.headers['Content-Type'] =
        'application/x-www-form-urlencoded'
    }
    if (contentType === 'application/json') {
      this.bodyText = JSON.stringify(this.body)
    } else if (contentType === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body)
        .map((key) => `key=${encodeURIComponent(this.body[key])}`)
        .join('&')
    }
    this.headers['Content-Length'] = this.bodyText.length
  }

  send(connnection) {
    return new Promise((resolve) => {
      const requestData = this.toString()
      // console.log('/* request */')
      // console.log(requestData)
      if (connnection) {
        connnection.write(requestData)
      } else {
        connnection = net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            connnection.write(requestData)
          }
        )
      }

      const parser = new ResponseParser()
      connnection.on('data', (data) => {
        const responseData = data.toString()
        // console.log('/* response */')
        // console.log(responseData)
        parser.receive(responseData)
        if (parser.isFinished) {
          resolve(parser.response)
          connnection.end()
        }
      })
      connnection.on('error', (error) => {
        console.log('connection error:', error)
        connnection.end()
      })
    })
  }

  toString() {
    const requestLine = `${this.method} ${this.path} HTTP/1.1`
    let headers = Object.keys(this.headers)
      .map((key) => `${key}: ${this.headers[key]}`)
      .join('\r\n')
    return `${requestLine}\r\n${headers}\r\n\r\n${this.bodyText}`
  }
}

module.exports = Request
