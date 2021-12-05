const http = require('http')
const https = require('https')
const unzipper = require('unzipper')
const querystring = require('querystring')

// auth route
function auth(request, response) {
  let query = request.url.match(/^\/auth\?([\s\S]+)$/)[1]
  query = querystring.parse(query)
  getToken(query.code, function (info) {
    console.log('token info:', info)
    const href = `http://localhost:4000/?token=${info.access_token}`
    const html = `<a href=${href}>Publish</a>`
    response.write(html)
    response.end()
  })
}

function getToken(code, callback) {
  const clientId = 'Iv1.cf3ff6db2854defa'
  const clientSecret = '428e7f5f672da5421d426ed8b98b1fef044b94b9'
  let path = '/login/oauth/access_token'
  path += `?code=${code}`
  path += `&client_id=${clientId}`
  path += `&client_secret=${clientSecret}`
  const request = https.request(
    {
      host: 'github.com',
      port: 443,
      path: path,
      method: 'POST',
    },
    function (response) {
      let body = ''
      response.on('data', (chunk) => {
        body += chunk.toString()
      })
      response.on('end', () => {
        const info = querystring.parse(body)
        callback(info)
      })
    }
  )
  request.end()
}

// publish route
function publish(request, response) {
  let query = request.url.match(/^\/auth\?([\s\S]+)$/)[1]
  query = querystring.parse(query)
  getUser(query.token, function (info) {
    if (info.login === 'yakel') {
      request.pipe(unzipper.Extract({ path: '../server/public/' }))
      request.on('end', function () {
        response.end('success')
      })
    }
  })
}

function getUser(token, callback) {
  const request = https.request(
    {
      host: 'api.github.com',
      port: 443,
      path: '/user',
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'toy-publish',
      },
    },
    function (response) {
      let body = ''
      response.on('data', (chunk) => {
        body += chunk.toString()
      })
      response.on('end', () => {
        const info = querystring.parse(body)
        callback(info)
      })
    }
  )
  request.end()
}

http
  .createServer(function (request, response) {
    console.log(request.url)
    if (request.url.match(/^\/auth\?/)) {
      return auth(request, response)
    } else if (request.url.match(/^\/publish\?/)) {
      return publish(request, response)
    }
  })
  .listen(3000)
