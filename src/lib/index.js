const fs = require('fs')
const http = require('http')
const path = require('path')
const { URL } = require('url');

const Modem = require('docker-modem')
const Swagger = require('swagger-client')
const yaml = require('js-yaml')

/**
 * We could load directly from docker.com, but having the file locally means
 * we can run in airplane mode:
 *
 *  Swagger('https://docs.docker.com/engine/api/v1.37/swagger.yaml')...
 */

/**
 * Swagger can't load local files, but it can take a 'spec'. So load the YAML
 * and convert to JSON:
 */

const apiVersion = `v1.37`
const yamlFile = path.resolve(__dirname, `../swagger/${apiVersion}/swagger.yaml`)
const spec = yaml.safeLoad(fs.readFileSync(yamlFile))

const dockerEngine = async (hostname) => {

  /**
   * If a remote host is specified then set up a tunnel:
   */

  let config
  if (hostname) {
    const tunnel = require('./tunnel')
    config = await tunnel(hostname);
  }

  const modem = new Modem(config)

  const swagger = await Swagger(
    'localhost',
    {
      spec,
      userFetch: (...args) => {

        /**
         * Add all of the arguments to the options, and also set isStream
         * to indicate to docker-modem that we want the res object back and
         * will handle it ourselves. (In other words we're just switching
         * out http.request() for now):
         */

        const options = {
          ...args[1],
          isStream: true
        }

        /**
         * docker-modem does a check on the returned data, that the status code
         * is expected. It codes a list of accepted values for each endpoint in
         * the statusCodes object. However, we don't want to maintain a list for
         * each endpoint so we'll just add success codes that would be expected
         * for each HTTP method.
         *
         * Note that docker-modem includes '200' for all endpoints with a comment
         * along the lines of 'this status code may be returned by a proxy':
         */

        switch (options.method) {
          case 'DELETE':
            options.statusCodes = { 200: true, 204: true }
            break;

          case 'GET':
            options.statusCodes = { 200: true }
            break;

          case 'POST':
            options.statusCodes = { 200: true, 201: true }
            break;
        }

        /**
         * The Swagger API uses '.body' whilst docker-modem wants '.options':
         *
         * Note that the Swagger client has converted our options to a JSON
         * string already so we need to undo it so that docker-modem can redo
         * it! (There may be a way around this, so will investigate later.)
         */

        if (options.body) {
          options.options = JSON.parse(options.body)
          delete options.body
        }

        /**
         * The URL from Swagger is ready to go, but it won't work if passed
         * straight to docker-modem. The problem is that docker-modem will
         * assume that the path doesn't have any query parameters and try to
         * remove any trailing '?'. It has the effect of converting this:
         *
         *   /abc?x=true
         *
         * to:
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
        options.path = url.pathname + '?'
        delete options.url

        const _query = {}
        for (const param of url.searchParams.entries()) {
          _query[param[0]] = param[1]
        }

        options.options = {
          ...options.options,
          _query
        }

        /**
         * Return a promise that does the request:
         */

        return new Promise((resolve, reject) => {
          modem.dial(options, (err, res) => {
            if (err) reject(err)

            /**
             * Collect all of the input:
             */

            else {
              let str = ''
              res.setEncoding('utf8')
              res.on('data', chunk => str += chunk)

              /**
               * Once the request has been fully received we need to set up a
               * Respone object that provides methods that give access to the
               * returned data:
               */

              res.on('end', () => {

                /**
                 * See https://github.com/swagger-api/swagger-js#response-shape
                 */

                resolve({
                  ok: res.statusCode >= 200 && res.statusCode <= 299,
                  headers: new Map(Object.entries(res.headers)),
                  status: res.statusCode,
                  statusText: res.statusMessage,
                  text: async () => str,
                  buffer: async () => str
                })
              })
            }
          })
        })
      }
    }
  )

  const fnHandler = {
    apply: async (target, thisArg, argumentsList) => {
      const ret = await target.apply(thisArg, argumentsList)
      return ret.obj || ret.text
    }
  }

  /**
   * Wrap the function with our own handler:
   */

  const actionHandler = {
    get: (obj, prop) => {
      return new Proxy(obj[prop], fnHandler)
    }
  }

  /**
   * Wrap the top level objects so that we can get at their functions:
   */

  const typesHandler = {
    get: (obj, prop) => {
      if (obj[prop] && typeof obj[prop] === 'object') {
        return new Proxy(obj[prop], actionHandler)
      }
      return obj[prop]
    }
  }
  return new Proxy(swagger.apis, typesHandler)
}

module.exports = dockerEngine;
