const tunnel = require('../src/lib/tunnel')

tunnel(process.env.DOCKER_AWS).then(tnl => {
  console.log('tunnel:', tnl)
})
