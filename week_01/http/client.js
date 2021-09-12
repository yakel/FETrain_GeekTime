const net = require('net')

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
      console.log('/* request */')
      console.log(requestData)
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
        console.log('/* response */')
        console.log(responseData)
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

class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0
    this.WAITING_STATUS_LINE_END = 1
    this.WAITING_HEADER_NAME = 2
    this.WAITING_HEADER_SPACE = 3
    this.WAITING_HEADER_VALUE = 4
    this.WAITING_HEADER_LINE_END = 5
    this.WAITING_HEADER_BLOCK_END = 6
    this.WAITING_BODY = 7

    this.current = this.WAITING_STATUS_LINE
    this.statusLine = ''
    this.headers = {}
    this.headerName = ''
    this.headerValue = ''
    this.bodyParser = null
  }

  receive(string) {
    for (let i = 0; i < string.length; i += 1) {
      this.receiveChar(string.charAt(i))
    }
  }

  receiveChar(char) {
    if (this.current === this.WAITING_STATUS_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_STATUS_LINE_END
      } else {
        this.statusLine += char
      }
    } else if (this.current === this.WAITING_STATUS_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME
      }
    } else if (this.current === this.WAITING_HEADER_NAME) {
      if (char === ':') {
        this.current = this.WAITING_HEADER_SPACE
      } else if (char === '\r') {
        this.current = this.WAITING_HEADER_BLOCK_END
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParser = new TrunkedBodyParser()
        }
      } else {
        this.headerName += char
      }
    } else if (this.current === this.WAITING_HEADER_SPACE) {
      if (char === ' ') {
        this.current = this.WAITING_HEADER_VALUE
      }
    } else if (this.current === this.WAITING_HEADER_VALUE) {
      if (char === '\r') {
        this.current = this.WAITING_HEADER_LINE_END
        this.headers[this.headerName] = this.headerValue
        this.headerName = ''
        this.headerValue = ''
      } else {
        this.headerValue += char
      }
    } else if (this.current === this.WAITING_HEADER_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME
      }
    } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
      if (char === '\n') {
        this.current = this.WAITING_BODY
      }
    } else if (this.current === this.WAITING_BODY) {
      this.bodyParser.receiveChar(char)
    }
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 (\d+) ([\s\S]+)/)
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join(''),
    }
  }
}

class TrunkedBodyParser {
  constructor() {
    this.WAITING_LENGTH = 0
    this.WAITING_LENGTH_LINE_END = 1
    this.READING_TRUNk = 2
    this.WAITING_NEW_LINE = 3
    this.WAITING_NEW_LINE_END = 4

    this.current = this.WAITING_LENGTH
    this.length = 0
    this.content = []
    this.isFinished = false
  }

  receiveChar(char) {
    if (this.current === this.WAITING_LENGTH) {
      if (char === '\r') {
        this.current = this.WAITING_LENGTH_LINE_END
        if (this.length === 0) {
          this.isFinished = true
        }
      } else {
        this.length *= 16
        this.length += parseInt(char, 16)
      }
    } else if (this.current === this.WAITING_LENGTH_LINE_END) {
      if (char === '\n') {
        this.current = this.READING_TRUNk
      }
    } else if (this.current === this.READING_TRUNk) {
      this.content.push(char)
      this.length -= 1
      if (this.length === 0) {
        this.current = this.WAITING_NEW_LINE
      }
    } else if (this.current === this.WAITING_NEW_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_NEW_LINE_END
      }
    } else if (this.current === this.WAITING_NEW_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_LENGTH
      }
    }
  }
}

async function testRequest() {
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

  const response = await request.send()
  console.log('response:', response)
}

testRequest()
