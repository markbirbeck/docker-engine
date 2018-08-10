const debug = require('debug')('docker-engine:modem')

/**
 * Adapter to allow docker-modem to be used with Swagger parameters:
 */

const Modem = require('docker-modem')

class SwaggerModem extends Modem {
  dial(req) {
    const options = { ...req }

    /**
     * docker-modem uses 'path' for the URL:
     */

    options.path = options.url
    delete options.url

    /**
     * docker-modem uses 'options._body' for 'body':
     */

    options.options = {
      _body: options.body
    }
    delete options.body

    /**
     * docker-modem just uses 'true' to indicate the acceptable status codes,
     * and they are numeric values, not strings:
     */

    options.statusCodes = {}
    Object.keys(options.responses).forEach(key => {
      options.statusCodes[+key] = true
    })
    delete options.responses

    /**
     * The options are ready to go:
     */

    debug(`about to call docker-modem.dial(): ${JSON.stringify(options)}`)

    return new Promise((resolve, reject) => {
      super.dial(options, (err, res) => {
        if (err) reject(err)
        else resolve(res)
      })
    })
  }
}

module.exports = SwaggerModem
