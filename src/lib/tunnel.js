const { Client } = require('ssh2')
const fs = require('fs')
const net = require('net')

module.exports = async (remoteDocker) => {
  const sshOpts = {
    username: 'docker',
    host: remoteDocker,
    privateKey: fs.readFileSync(__dirname + '/docker-swarm.pem', 'utf8')
  }
  const conn = new Client()

  return new Promise((resolve, reject) => {
    conn.on('error', err => {
      console.log('SSH - Connection Error: ' + err)
      reject(err)
    })
    conn.on('close', hadError => {
      console.log('SSH - Connection Closed', hadError)
      if (hadError) reject()
    })
    conn.on('end', () => {
      console.log('SSH - Connection Ended')
    })
    conn.on('authentication', ctx => {
      console.log('got authentication')
      ctx.accept()
    })
    conn.on('banner', console.log.bind(null, 'got banner:')
    })
    conn.on('ready', function() {
      const f = conn.openssh_forwardOutStreamLocal('/var/run/docker.sock', (err, stream) => {
        if (err) reject(err)
        const server = net.createServer(c => {
          stream.pipe(c).pipe(stream)
          .on('close', () => {
            conn.end()
          })
          c.on('error', console.error.bind(null, 'proxy request error: '))
          stream.on('error', console.error.bind(null, 'ssh stream error: '))
        })
        // listen on an ephemeral port and modify the input URL to connect to us
        // instead of the original target
        server.listen(0, 'localhost', function() {
          // compose object for connecting to this little TCP proxy server
          resolve({
            host: server.address().address,
            port: server.address().port
          })
        })

        server.on('error', console.error.bind(null, 'proxy server error: '))

        /**
         * Ensure the app can close ok if we're the only code using these
         * objects:
         */

        server.unref()
        conn._sock.unref()
      })
    })
    conn.connect(sshOpts)
  })
}
