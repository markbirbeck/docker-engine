const tunnel = require('../src/lib/tunnel')

tunnel(process.env.DOCKER_AWS).then(url => {
  console.log('url:', url)
})
