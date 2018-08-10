const debug = require('debug')('docker-engine:api')

const Builder = require('./SwaggerRequestBuilder')
const Modem = require('./SwaggerModem')

class DockerEngine {
  constructor(config) {
    this.builder = new Builder()
    this.modem = new Modem(config)

    /**
     * Set up a handler that will cope with all operation IDs:
     */

    const handler = {
      get(obj, prop) {
        return params => {
          return obj.dial(obj.builder[prop](params))
        }
      }
    }

    return new Proxy(this, handler)
  }

  dial(req) {
    debug(`about to dial: ${JSON.stringify(req)}`)
    return this.modem.dial(req)
  }
}

module.exports = DockerEngine
