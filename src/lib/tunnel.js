const { Client } = require('ssh2')
const fs = require('fs')
const net = require('net')

module.exports = async (remoteDocker) => {
  const sshOpts = {
    username: 'docker',
    host: remoteDocker,
    privateKey: fs.readFileSync(__dirname + '/docker-swarm.pem', 'utf8')
  }

  return new Promise((resolve, reject) => {
    const server = net
    .createServer(sock => {
      console.log('created server')
      const conn = new Client()
      conn.on('ready', () => {
        console.log('connection ready')
        conn._sock.unref()
        conn
        .openssh_forwardOutStreamLocal('/var/run/docker.sock', (err, stream) => {
          console.log('setting up forwarding')
          if (err) {
            console.log('closing connection because forwarding not set:', err)
            conn.end()
            return sock.writable && sock.end()
          }

          if (sock.readable && sock.writable) {
            console.log('wiring up streams')
            stream
            .pipe(sock)
            .pipe(stream)
            .on('end', () => {
              console.log('closing connection after streams have ended')
              conn.end()
            })
            .on('close', () => {
              console.log('closing connection after streams have closed')
              conn.end()
            })
          } else {
            console.log('closing connection because stream not read/write')
            conn.end()
          }
        })
      })
      .on('error', err => {
        console.log('error creating client:', err)
        return sock.writable && sock.end()
      })
      .connect(sshOpts)
    })

    server.listen(0, 'localhost', () => {
      console.log('server listening')
      server.unref()
      resolve({
        host: server.address().address,
        port: server.address().port
      })
    })
  })
}
