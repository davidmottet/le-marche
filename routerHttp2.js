const { constants } = require('http2')
const { join, parse } = require('path')
const { lookup } = require('mime-types')

const httpdocs = './httpdocs'

const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_METHOD,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_METHOD_NOT_ALLOWED,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK
} = constants

module.exports = (stream, headers) => {
  const reqPath = headers[HTTP2_HEADER_PATH]
  const reqMethod = headers[HTTP2_HEADER_METHOD]

  const onError = ({ code }) => {
    if (code === 'ENOENT') {
      stream.respond({ ':status': HTTP_STATUS_NOT_FOUND })
    } else if (code === 405) {
      stream.respond({ ':status': HTTP_STATUS_METHOD_NOT_ALLOWED })
    } else {
      stream.respond({ ':status': HTTP_STATUS_INTERNAL_SERVER_ERROR })
    }
    stream.end()
  }

  const statCheck = ({ ino, size, mtime }) => {
    headers['last-modified'] = mtime.toUTCString()
    headers['ETag'] = `"${[ino, size, mtime.toISOString()].join('-')}"`
  }

  switch (reqMethod) {
    case 'GET':
      const { base, ext } = parse(reqPath)
      let pathFile = join(httpdocs, reqPath, !base ? 'index' : '')
      if (!ext) { pathFile += '.html' }

      stream.respondWithFile(pathFile, {
        'content-type': `${lookup(pathFile)}; charset=utf-8`
      },
      { statCheck, onError })
      break
    case 'POST':
      let data = ''
      stream
        .on('data', chunk => {
          data += chunk
          console.log(data)
        })
        .on('end', () => {
          stream.respond({ ':status': HTTP_STATUS_OK })
          stream.end('Ok')
        })
      break
    default:
      onError({ code: 405 })
      break
  }
}
