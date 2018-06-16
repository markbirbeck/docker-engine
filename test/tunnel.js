const tunnel = require('../src/lib/tunnel')

tunnel(process.env.DOCKER_AWS).then(urlObj => {
  console.log('host and port:', urlObj)
})
