const debug = require('debug')('docker-engine:api')

const Builder = require('./SwaggerRequestBuilder')
const Modem = require('./SwaggerModem')

class DockerEngine {
  constructor(config) {
    this.builder = new Builder()
    this.modem = new Modem(config)
  }

  ContainerCreate(params) {
    const req = this.builder.ContainerCreate(params)
    debug(`about to dial: ${JSON.stringify(req)}`)
    return this.modem.dial(req)
  }
}

module.exports = DockerEngine
