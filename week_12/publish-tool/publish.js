const http = require('http')
const archiver = require('archiver')
const child_process = require('child_process')
const querystring = require('querystring')

// open github auth page in browser
const clientId = 'Iv1.cf3ff6db2854defa'
const url = `https://github.com/login/oauth/authorize?client_id=${clientId}`
const cmd = `open ${url}`
child_process.exec(cmd)

// create server, then get toekn
http
  .createServer(function (request, response) {
    let query = request.url.match(/^\/\?([\s\S]+)$/)[1]
    query = querystring.parse(query)
    publish(token)
  })
  .listen(4000)

function publish(token) {
  const request = http.request(
    {
      hostname: '127.0.0.1',
      port: 3000,
      method: 'POST',
      path: `/publish?token=${token}`,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    },
    (response) => {
      console.log('response:', response)
    }
  )

  const archive = archiver('zip', { zlib: { level: 9 } })
  archive.pipe(request)
  archive.directory('./sample', false)
  archive.finalize()
}
