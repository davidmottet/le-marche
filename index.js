const { createSecureServer } = require('http2')
const { readFileSync } = require('fs')
const routerHttp2 = require('./routerHttp2')

createSecureServer({
  key: readFileSync('./pems/localhost-privkey.pem'),
  cert: readFileSync('./pems/localhost-cert.pem'),
  allowHTTP1: true
}).on('stream', routerHttp2)
  .listen(443)
