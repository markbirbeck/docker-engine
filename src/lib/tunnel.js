const debug = require('debug')('docker-engine:tunnel')
const { Client } = require('ssh2')
const fs = require('fs')
const net = require('net')

module.exports = async (config) => {
  const sshOpts = { ...config }
  delete sshOpts.socketPath

  return new Promise((resolve, reject) => {
    const server = net
    .createServer(sock => {
      debug('created server')
      const conn = new Client()
      conn.on('ready', () => {
        debug('connection ready')
        conn._sock.unref()
        conn
        .openssh_forwardOutStreamLocal(config.socketPath, (err, stream) => {
          debug('setting up forwarding')
          if (err) {
            debug('closing connection because forwarding not set:', err)
            conn.end()
            return sock.writable && sock.end()
          }

          if (sock.readable && sock.writable) {
            debug('wiring up streams')
            stream
            .pipe(sock)
            .pipe(stream)
            .on('end', () => {
              debug('closing connection after streams have ended')
              conn.end()
            })
            .on('close', () => {
              debug('closing connection after streams have closed')
              conn.end()
            })
          } else {
            debug('closing connection because stream not read/write')
            conn.end()
          }
        })
      })
      .on('error', err => {
        debug('error creating client:', err)
        return sock.writable && sock.end()
      })
      .connect(sshOpts)
    })

    server.listen(0, 'localhost', () => {
      debug('server listening')
      server.unref()
      resolve({
        host: server.address().address,
        port: server.address().port
      })
    })
  })
}
