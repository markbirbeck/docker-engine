const tunnel = require('strong-tunnel')
const fs = require('fs')

module.exports = async (remoteDocker) => {
  const sshOpts = {
    username: 'docker',
    privateKey: fs.readFileSync(__dirname + '/docker-swarm.pem', 'utf8')
  }

  return new Promise((resolve, reject) => {
    tunnel(remoteDocker, sshOpts, function(err, url) {
      if (err) reject(err)
      // this returned url the local proxy, something like 'tcp://127.0.0.1:23989'
      // docker requests now tunnelled over ssh via a local proxy
      else resolve(url)
    })
  })
}
