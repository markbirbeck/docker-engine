const debug = require('debug')('docker-engine:api')

const Builder = require('./SwaggerRequestBuilder')
const Modem = require('./SwaggerModem')

class DockerEngine {
  constructor(config) {
    this.builder = new Builder()
    this.modem = new Modem(config)
  }

  dial(req) {
    debug(`about to dial: ${JSON.stringify(req)}`)
    return this.modem.dial(req)
  }

  ContainerCreate(params) {
    return this.dial(this.builder.ContainerCreate(params))
  }

  ContainerDelete(params) {
    return this.dial(this.builder.ContainerDelete(params))
  }
}

module.exports = DockerEngine
