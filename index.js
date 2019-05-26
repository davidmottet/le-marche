const { constants, createSecureServer } = require('http2')
const { readFileSync } = require('fs')
const { join } = require('path')
const { lookup } = require('mime-types')

const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_METHOD,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR
} = constants

const options = {
  key: readFileSync('./pems/  localhost-privkey.pem'),
  cert: readFileSync('./pems/ localhost-cert.pem'),
  allowHTTP1: true
}

const server = createSecureServer(options)

const serverRoot = './public'

const etag = ({ ino, size, mtime }) => `"${[ino, size, mtime.toISOString()].join('-')}"`

const statCheck = (stat, headers) => {
  headers['last-modified'] = stat.mtime.toUTCString()
  headers['ETag'] = etag(stat)
}

server.on('stream', ({ end, respond, respondWithFile }, headers) => {
  const reqPath = headers[HTTP2_HEADER_PATH]
  const pathFile = join(serverRoot, reqPath)

  const onError = ({ code }) => {
    if (code === 'ENOENT') {
      respond({ ':status': HTTP_STATUS_NOT_FOUND })
    } else {
      respond({ ':status': HTTP_STATUS_INTERNAL_SERVER_ERROR })
    }
    end()
  }

  respondWithFile(pathFile, {
    'content-type': `${lookup(pathFile)}; charset=utf-8`
  },
  { statCheck, onError })
})

server.listen(443)
