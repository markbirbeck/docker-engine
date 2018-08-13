const debug = require('debug')('docker-engine:modem')

/**
 * Adapter to allow docker-modem to be used with Swagger parameters:
 */

const { URL } = require('url')
const Modem = require('docker-modem')

class SwaggerModem extends Modem {
  dial(req) {
    const options = { ...req }

    /**
     * The URL from Swagger is ready to go, but it won't work if passed
     * straight to docker-modem. The problem is that docker-modem will
     * assume that the path doesn't have any query parameters and try to
     * remove any trailing '?'. It has the effect of converting this:
     *
     *   /abc?x=true
     *
     * to this:
     *
     *  /abc?x=tru
     *
     * The easiest solution is to break the URL up and pass the components
     * to docker-modem, and let it build the URL back up again:
     */

    /**
     *
     * NOTE: The base parameter is required by the URL() constructor so we
     * must have something there. But since we only use '.pathname' and
     * '.searchParams' it doesn't matter what value we use.
     */

    const url = new URL(options.url, 'http://localhost')

    /**
     * docker-modem uses 'path' for the URL:
     *
     * NOTE: The trailing '?' seems to be important in docker-modem, although
     * I think it's a bug. I've raised an issue to track it:
     *
     *  https://github.com/apocas/docker-modem/issues/95
     */

    options.path = url.pathname + '?'
    delete options.url

    /**
     * docker-modem uses 'options._query' for URL search parameters:
     */

    const _query = {}
    for (const param of url.searchParams.entries()) {
      _query[param[0]] = param[1]
    }

    /**
     * docker-modem uses 'options._body' for 'body':
     */

    const _body = options.body || {}
    delete options.body

    /**
     * Place _body and _query in 'options':
     */

    options.options = {
      _body,
      _query
    }

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
     * If we are streaming something then ask for the stream object to be
     * returned (otherwise we just let docker-modem handle the text processing):
     *
     * Note that we check for String('true') rather than Boolean(true) because
     * by the time we get to this code the parameters have been prepared for use
     * in a URL.
     */

    options.isStream = ['follow', 'logs', 'stream']
    .some(key => options.options._query[key] === 'true')

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
