const tunnel = require('tunnel-ssh')
const fs = require('fs')

module.exports = async (remoteDocker) => {
  const sshOpts = {
    username: 'docker',
    host: remoteDocker,
    dstHost: '/var/run/docker.sock',
    privateKey: fs.readFileSync(__dirname + '/docker-swarm.pem', 'utf8')
  }

  return new Promise((resolve, reject) => {
    tunnel(sshOpts, function(err, tnl) {
      if (err) reject(err)
      else resolve(tnl)
    })
  })
}
